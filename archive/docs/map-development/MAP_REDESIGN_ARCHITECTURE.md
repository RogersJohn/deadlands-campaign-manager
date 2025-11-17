# Battle Map System Redesign - Architecture Document

**Date**: 2025-11-17
**Status**: 📋 Design Phase
**Goal**: Create semi-realistic top-down battle maps that replace the entire arena with tactical overlays and persistence

---

## Current Problems

### 1. Visual Quality
- ❌ Terrain uses colored rectangles (no textures)
- ❌ Buildings are outlined boxes
- ❌ Cover objects are basic circles
- ❌ Prompt includes "pixel art style" - not realistic
- ❌ Overall aesthetic is placeholder-quality

### 2. Map Positioning
- ❌ Maps render at (0, 0) in a huge 200x200 tile arena (6400x6400 pixels)
- ❌ Map is "drawn in corner" instead of becoming THE arena
- ❌ Player spawns far away at (3200, 3200)
- ❌ Multiple disconnected systems (arena grid + generated map)

### 3. No Persistence
- ❌ Maps cannot be saved
- ❌ Cannot reuse maps later
- ❌ No map library
- ❌ GM has to regenerate maps every time

---

## New Architecture Goals

### 1. **Realistic Top-Down Images**
- ✅ Semi-realistic aerial/satellite view style
- ✅ Actual terrain textures (grass, dirt, stone, wood)
- ✅ Realistic buildings with walls, doors, windows
- ✅ Natural cover (rocks, barrels, wagon wheels)
- ✅ Proper Deadlands 1870s Western aesthetic

### 2. **Map Becomes Arena**
- ✅ When map loads, it REPLACES the entire arena
- ✅ Arena dimensions match map size (not fixed 200x200)
- ✅ Player spawns on the new map
- ✅ No "drawing in corner" - map IS the playable area

### 3. **Tactical Overlay System**
- ✅ Grid lines overlaid on realistic image
- ✅ Wall/obstacle highlighting (collision boundaries)
- ✅ Cover position markers (+2, +4 defense bonuses)
- ✅ Movement range visualization
- ✅ Toggle overlays on/off

### 4. **Map Persistence**
- ✅ Save generated maps to database
- ✅ Load saved maps instantly
- ✅ Map library UI for browsing
- ✅ Share maps between campaigns/sessions

---

## Technical Architecture

### Backend Changes

#### 1. Create BattleMap Entity
**File**: `backend/src/main/java/com/deadlands/campaign/model/BattleMap.java`

```java
@Entity
@Table(name = "battle_maps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class BattleMap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    // Map dimensions (in tiles)
    @Column(nullable = false)
    private Integer widthTiles;

    @Column(nullable = false)
    private Integer heightTiles;

    // Generated map image (base64 or URL)
    @Column(length = 5000000) // ~5MB for base64 image
    private String imageData;

    @Column(length = 500)
    private String imageUrl; // Alternative: external storage URL

    // AI prompt used to generate
    @Column(length = 2000)
    private String generationPrompt;

    // Map metadata (JSON)
    @Column(length = 50000, columnDefinition = "TEXT")
    private String mapData; // Serialized GeneratedMap JSON

    // Tactical data
    @Column(length = 10000, columnDefinition = "TEXT")
    private String wallsData; // JSON array of wall coordinates

    @Column(length = 10000, columnDefinition = "TEXT")
    private String coverData; // JSON array of cover positions with bonuses

    @Column(length = 5000, columnDefinition = "TEXT")
    private String spawnPointsData; // JSON array of player/NPC spawn points

    // Ownership
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    // Visibility
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MapVisibility visibility = MapVisibility.PRIVATE;

    // Categories/Tags
    @Column(length = 500)
    private String tags; // Comma-separated: "town,combat,outdoor,medium"

    @Enumerated(EnumType.STRING)
    private MapType type; // TOWN_STREET, WILDERNESS, INTERIOR, MINE, FORT

    @Enumerated(EnumType.STRING)
    private BattleTheme theme; // COMBAT, CHASE, AMBUSH, SIEGE, EXPLORATION

    // Timestamps
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}

enum MapVisibility {
    PRIVATE,  // Only creator can see
    CAMPAIGN, // All players in campaign can see
    PUBLIC    // All GMs can see
}

enum MapType {
    TOWN_STREET,
    WILDERNESS,
    INTERIOR,
    MINE,
    FORT,
    CUSTOM
}

enum BattleTheme {
    COMBAT,      // Lots of cover
    CHASE,       // Open spaces
    AMBUSH,      // Asymmetric
    SIEGE,       // Defensible
    EXPLORATION  // Mixed
}
```

#### 2. Create Repository
**File**: `backend/src/main/java/com/deadlands/campaign/repository/BattleMapRepository.java`

```java
@Repository
public interface BattleMapRepository extends JpaRepository<BattleMap, Long> {
    List<BattleMap> findByCreatedByOrderByCreatedAtDesc(User user);
    List<BattleMap> findByVisibilityOrderByCreatedAtDesc(MapVisibility visibility);
    List<BattleMap> findByTypeAndVisibilityIn(MapType type, List<MapVisibility> visibilities);
    List<BattleMap> findByTagsContainingAndVisibilityIn(String tag, List<MapVisibility> visibilities);
}
```

#### 3. Add Endpoints to AIAssistantController
**File**: `backend/src/main/java/com/deadlands/campaign/controller/AIAssistantController.java`

```java
// Save generated map
@PostMapping("/maps/save")
public ResponseEntity<BattleMap> saveMap(@RequestBody SaveMapRequest request, Principal principal) {
    // Create BattleMap from GeneratedMap + additional metadata
    // Save to database
    // Return saved entity
}

// Get user's saved maps
@GetMapping("/maps/my-maps")
public ResponseEntity<List<BattleMapDTO>> getMyMaps(Principal principal) {
    // Fetch maps created by current user
    // Return lightweight DTOs (exclude large image data)
}

// Get public maps
@GetMapping("/maps/library")
public ResponseEntity<List<BattleMapDTO>> getMapLibrary(@RequestParam(required = false) String tag) {
    // Fetch public maps, optionally filtered by tag
}

// Load specific map (includes full image data)
@GetMapping("/maps/{id}")
public ResponseEntity<BattleMap> getMap(@PathVariable Long id, Principal principal) {
    // Fetch full map including image data
    // Check visibility permissions
}

// Delete map
@DeleteMapping("/maps/{id}")
public ResponseEntity<Void> deleteMap(@PathVariable Long id, Principal principal) {
    // Delete if owned by user
}
```

#### 4. Update ImageGenerationService
**File**: `backend/src/main/java/com/deadlands/campaign/service/ImageGenerationService.java`

**Current Prompt**:
```java
"top-down view, orthographic, battle map, grid map, game map, tactical map,
pixel art style, high contrast, clear details, western theme, 1870s, Deadlands RPG"
```

**New Prompt** (Realistic):
```java
String enhancedPrompt = String.format(
    "%s, realistic top-down aerial view, overhead satellite photograph, " +
    "photorealistic, natural lighting, highly detailed, tactical battle map, " +
    "1870s old west, Deadlands setting, clear terrain features, " +
    "visible walls and structures, natural cover, professional game map quality, " +
    "orthographic projection, no perspective distortion",
    prompt
);

String negativePrompt = "blurry, perspective view, 3d rendering, isometric, " +
    "people, characters, animals, text, watermarks, low quality, " +
    "pixel art, cartoon, anime, sketchy, draft, unfinished, " +
    "diagonal walls, curved perspective, fish-eye, distortion";
```

**Key Changes**:
- Remove "pixel art style" ❌
- Add "realistic, photorealistic, aerial photograph" ✅
- Add "natural lighting, highly detailed" ✅
- Keep "orthographic projection" for true top-down ✅

---

### Frontend Changes

#### 1. Redesign MapLoader.ts
**File**: `frontend/src/game/utils/MapLoader.ts`

**Current Behavior**: Renders map at (0, 0) in existing 200x200 arena
**New Behavior**: Replaces entire arena with the map

```typescript
export class MapLoader {
  private scene: Phaser.Scene;
  private tileSize: number = 32;

  // Map layers
  private backgroundImage?: Phaser.GameObjects.Image;
  private tacticalGrid?: Phaser.GameObjects.Graphics;
  private wallHighlights?: Phaser.GameObjects.Graphics;
  private coverMarkers?: Phaser.GameObjects.Group;
  private spawnPoints?: Phaser.GameObjects.Group;

  /**
   * Load map and REPLACE the entire arena
   */
  async loadMapAsArena(mapData: GeneratedMap | BattleMap): Promise<void> {
    console.log('Loading map as arena:', mapData.name);

    // Step 1: Clear everything (destroy old arena)
    this.clearEntireArena();

    // Step 2: Set new world bounds to match map size
    const mapWidth = mapData.size.width * this.tileSize;
    const mapHeight = mapData.size.height * this.tileSize;
    this.scene.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // Step 3: Load background image (the realistic top-down photo)
    if (mapData.imageUrl || mapData.imageData) {
      await this.loadBackgroundImage(
        mapData.imageUrl || mapData.imageData,
        mapData.size.width,
        mapData.size.height
      );
    }

    // Step 4: Create tactical grid overlay
    this.createTacticalGrid(mapData.size.width, mapData.size.height);

    // Step 5: Highlight walls/obstacles
    if (mapData.walls || mapData.wallsData) {
      this.highlightWalls(mapData.walls || JSON.parse(mapData.wallsData));
    }

    // Step 6: Mark cover positions
    if (mapData.cover || mapData.coverData) {
      this.markCover(mapData.cover || JSON.parse(mapData.coverData));
    }

    // Step 7: Place spawn points
    if (mapData.spawnPoints || mapData.spawnPointsData) {
      this.placeSpawnPoints(mapData.spawnPoints || JSON.parse(mapData.spawnPointsData));
    }

    // Step 8: Move player to spawn point
    this.movePlayerToSpawn();

    // Step 9: Center camera on player
    this.scene.cameras.main.startFollow(this.scene.player);
    this.scene.cameras.main.setZoom(1);

    console.log(`Arena replaced with map: ${mapWidth}x${mapHeight} pixels`);
  }

  /**
   * Clear entire arena (not just map layers)
   */
  private clearEntireArena(): void {
    // Destroy all game objects
    this.scene.children.removeAll(true);

    // Reset physics
    this.scene.physics.world.colliders.destroy();

    console.log('Arena cleared');
  }

  /**
   * Create tactical grid overlay on top of realistic image
   */
  private createTacticalGrid(width: number, height: number): void {
    this.tacticalGrid = this.scene.add.graphics();
    this.tacticalGrid.setDepth(100); // Above image, below UI

    // Draw grid lines
    this.tacticalGrid.lineStyle(1, 0xffffff, 0.15); // Subtle white lines

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const worldX = x * this.tileSize;
      this.tacticalGrid.lineBetween(
        worldX,
        0,
        worldX,
        height * this.tileSize
      );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      const worldY = y * this.tileSize;
      this.tacticalGrid.lineBetween(
        0,
        worldY,
        width * this.tileSize,
        worldY
      );
    }

    // Highlight every 5th line for easier counting
    this.tacticalGrid.lineStyle(2, 0xffffff, 0.3);
    for (let x = 0; x <= width; x += 5) {
      const worldX = x * this.tileSize;
      this.tacticalGrid.lineBetween(worldX, 0, worldX, height * this.tileSize);
    }
    for (let y = 0; y <= height; y += 5) {
      const worldY = y * this.tileSize;
      this.tacticalGrid.lineBetween(0, worldY, width * this.tileSize, worldY);
    }
  }

  /**
   * Highlight walls and obstacles with colored overlay
   */
  private highlightWalls(walls: WallData[]): void {
    this.wallHighlights = this.scene.add.graphics();
    this.wallHighlights.setDepth(101);

    walls.forEach(wall => {
      // Draw red semi-transparent overlay over walls
      this.wallHighlights.fillStyle(0xff0000, 0.2);
      this.wallHighlights.fillRect(
        wall.x * this.tileSize,
        wall.y * this.tileSize,
        wall.width * this.tileSize,
        wall.height * this.tileSize
      );

      // Add red border
      this.wallHighlights.lineStyle(2, 0xff0000, 0.6);
      this.wallHighlights.strokeRect(
        wall.x * this.tileSize,
        wall.y * this.tileSize,
        wall.width * this.tileSize,
        wall.height * this.tileSize
      );
    });
  }

  /**
   * Mark cover positions with defense bonus indicators
   */
  private markCover(coverPositions: CoverData[]): void {
    this.coverMarkers = this.scene.add.group();

    coverPositions.forEach(cover => {
      const worldX = cover.x * this.tileSize;
      const worldY = cover.y * this.tileSize;

      // Green semi-transparent marker
      const marker = this.scene.add.graphics();
      marker.fillStyle(0x00ff00, 0.3);
      marker.fillCircle(worldX + this.tileSize/2, worldY + this.tileSize/2, this.tileSize/2);
      marker.lineStyle(2, 0x00ff00, 0.8);
      marker.strokeCircle(worldX + this.tileSize/2, worldY + this.tileSize/2, this.tileSize/2);
      marker.setDepth(102);

      // Defense bonus label
      const label = this.scene.add.text(
        worldX + this.tileSize/2,
        worldY + this.tileSize/2,
        `+${cover.bonus}`,
        {
          fontSize: '14px',
          color: '#00ff00',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        }
      );
      label.setOrigin(0.5);
      label.setDepth(103);

      this.coverMarkers.add(marker);
      this.coverMarkers.add(label);
    });
  }

  /**
   * Toggle tactical overlays on/off
   */
  toggleGrid(visible: boolean): void {
    if (this.tacticalGrid) {
      this.tacticalGrid.setVisible(visible);
    }
  }

  toggleWalls(visible: boolean): void {
    if (this.wallHighlights) {
      this.wallHighlights.setVisible(visible);
    }
  }

  toggleCover(visible: boolean): void {
    if (this.coverMarkers) {
      this.coverMarkers.setVisible(visible);
    }
  }
}
```

#### 2. Add Map Library UI
**File**: `frontend/src/components/ai/MapLibraryTab.tsx`

```typescript
interface MapLibraryTabProps {
  onMapSelected: (map: BattleMap) => void;
}

export function MapLibraryTab({ onMapSelected }: MapLibraryTabProps) {
  const [myMaps, setMyMaps] = useState<BattleMapDTO[]>([]);
  const [publicMaps, setPublicMaps] = useState<BattleMapDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    setLoading(true);
    const [myMapsData, publicMapsData] = await Promise.all([
      mapService.getMyMaps(),
      mapService.getPublicMaps()
    ]);
    setMyMaps(myMapsData);
    setPublicMaps(publicMapsData);
    setLoading(false);
  };

  const handleLoadMap = async (mapId: number) => {
    const fullMap = await mapService.getMap(mapId);
    onMapSelected(fullMap);
  };

  return (
    <Box>
      <Tabs>
        <Tab label="My Maps" />
        <Tab label="Public Library" />
      </Tabs>

      <TabPanel value={0}>
        <Grid container spacing={2}>
          {myMaps.map(map => (
            <Grid item xs={12} md={6} key={map.id}>
              <Card>
                <CardMedia image={map.thumbnailUrl} height={140} />
                <CardContent>
                  <Typography variant="h6">{map.name}</Typography>
                  <Typography variant="body2">{map.description}</Typography>
                  <Chip label={`${map.widthTiles}x${map.heightTiles}`} size="small" />
                  <Chip label={map.type} size="small" />
                </CardContent>
                <CardActions>
                  <Button onClick={() => handleLoadMap(map.id)}>Load in Game</Button>
                  <Button color="error">Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={1}>
        {/* Similar grid for public maps */}
      </TabPanel>
    </Box>
  );
}
```

#### 3. Update MapGeneratorTab
**File**: `frontend/src/components/ai/MapGeneratorTab.tsx`

Add "Save Map" button after generation:

```typescript
const handleSaveMap = async () => {
  if (!generatedMap) return;

  const saveRequest = {
    name: generatedMap.name,
    description: generatedMap.description,
    widthTiles: generatedMap.size.width,
    heightTiles: generatedMap.size.height,
    imageData: generatedMap.imageUrl,
    mapData: JSON.stringify(generatedMap),
    wallsData: JSON.stringify(extractWalls(generatedMap)),
    coverData: JSON.stringify(generatedMap.cover),
    visibility: 'PRIVATE', // or let user choose
    type: locationType.toUpperCase(),
    theme: theme.toUpperCase(),
    tags: `${locationType},${theme},${size}`
  };

  const saved = await mapService.saveMap(saveRequest);
  alert(`Map "${saved.name}" saved to your library!`);
};
```

---

## Implementation Phases

### Phase 1: Backend Persistence (2-3 hours)
1. Create `BattleMap` entity
2. Create `BattleMapRepository`
3. Add save/load endpoints to `AIAssistantController`
4. Test with Postman/curl

### Phase 2: Improve AI Generation (1-2 hours)
1. Update `ImageGenerationService` prompts
2. Remove "pixel art" style
3. Add "realistic, photorealistic" keywords
4. Test generation quality

### Phase 3: Redesign MapLoader (3-4 hours)
1. Implement `loadMapAsArena()` method
2. Add `clearEntireArena()` method
3. Implement tactical overlays (grid, walls, cover)
4. Add toggle methods for overlays
5. Test map loading

### Phase 4: Map Library UI (2-3 hours)
1. Create `MapLibraryTab` component
2. Create `mapService.ts` API client
3. Add to `AIAssistantPanel` tabs
4. Test save/load workflow

### Phase 5: Integration & Polish (1-2 hours)
1. Connect all systems
2. Add loading states
3. Error handling
4. UI polish
5. End-to-end testing

**Total Estimated Time**: 9-14 hours

---

## Data Flow

### Map Generation Flow
```
1. GM opens AI Assistant → Map Gen tab
2. Fills in parameters (type, size, theme, description)
3. Clicks "Generate Map"
4. Backend calls AI with realistic prompt
5. Generates semi-realistic top-down image
6. Returns GeneratedMap with image + tactical data
7. GM sees preview
8. GM clicks "Save Map"
9. Map saved to database as BattleMap
10. GM clicks "Load in Game"
11. Frontend sends map to Phaser
12. MapLoader REPLACES entire arena with map
13. Player spawns on new map
14. Game ready for combat
```

### Map Library Flow
```
1. GM opens AI Assistant → Map Library tab
2. Sees grid of saved maps (thumbnails)
3. Can filter by type, theme, tags
4. Clicks "Load in Game" on a map
5. Frontend fetches full map data
6. MapLoader replaces arena
7. Instant map switch - no regeneration
```

---

## Benefits

### For Game Masters
- ✅ Save time with map library (no regeneration)
- ✅ Build collection of battle maps
- ✅ Realistic, professional-quality maps
- ✅ Reuse maps across sessions/campaigns
- ✅ Quick setup for impromptu battles

### For Players
- ✅ Better visual experience (realistic vs. placeholder)
- ✅ Clearer tactical information (grid, walls, cover)
- ✅ Easier to understand battlefield layout
- ✅ More immersive combat experience

### Technical
- ✅ Clean architecture (map = arena, not two separate systems)
- ✅ Database persistence
- ✅ Reusable resources
- ✅ Scalable (can add more map features later)

---

## Future Enhancements

### Advanced Features (Post-MVP)
- **Fog of War**: Hide unexplored areas
- **Dynamic Lighting**: Day/night, torches, spells
- **Destructible Terrain**: Buildings can be damaged
- **Token Placement**: Drag-drop enemies/NPCs onto map
- **Weather Effects**: Rain, fog, dust storms
- **Multi-Floor Maps**: Indoor maps with stairs
- **Map Editor**: Manual tweaking after AI generation
- **Template System**: Pre-built layouts with AI customization
- **Sharing**: Export/import maps as JSON files

---

## Next Steps

1. Review this architecture document
2. Decide on implementation approach:
   - All phases at once (9-14 hours)
   - OR implement phase-by-phase over multiple sessions
3. Start with Phase 1 (Backend Persistence) for immediate value

**Ready to build realistic, reusable battle maps!** 🗺️
