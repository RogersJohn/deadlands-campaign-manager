# AI Map Generation - Implementation Proposal

**Date:** 2025-11-14
**Status:** PROPOSAL - Awaiting Decision

---

## Overview

Add AI-powered visual map generation to the GM toolkit, allowing GMs to generate playable battle maps with terrain, buildings, and NPCs - all game-ready for Phaser.

---

## Recommended Approach: Procedural Generation via JSON

### Why This Approach?

1. **Cost-Effective:** ~$0.01 per map (Claude text generation)
2. **Game-Ready:** Works with existing Phaser tile system
3. **Interactive:** Full collision, terrain modifiers, fog of war
4. **Consistent:** Uses existing terrain types and assets
5. **Fast:** 5-10 seconds to generate vs 30-60s for image generation

### How It Works

```
GM Request:
"Generate a medium-sized mining camp with 3 buildings, rocky terrain,
and a creek running through it"

↓

Claude AI generates JSON:
{
  "name": "Deadwood Mining Camp",
  "size": { "width": 30, "height": 20 },
  "terrain": [
    { "type": "dirt", "coords": [[0,0], [1,0], ...] },
    { "type": "rocks", "coords": [[5,3], [6,3], ...] },
    { "type": "water", "coords": [[10,0], [10,1], ...] }
  ],
  "buildings": [
    {
      "name": "Mine Entrance",
      "type": "mine",
      "position": { "x": 15, "y": 5 },
      "size": { "width": 3, "height": 2 },
      "entrances": [{ "x": 16, "y": 7, "direction": "south" }]
    }
  ],
  "npcs": [
    {
      "name": "Old Pete (Miner)",
      "position": { "x": 14, "y": 6 },
      "personality": "Gruff, suspicious of outsiders"
    }
  ],
  "cover": [
    { "type": "barrel", "position": { "x": 8, "y": 10 }, "coverBonus": 2 }
  ]
}

↓

Phaser renders map using existing tile assets
```

---

## Implementation Plan

### Phase 1: Basic Map Generation (2-4 hours)

#### Backend Changes

**1. New DTO: MapGenerationRequest.java**
```java
public class MapGenerationRequest {
    private String locationType; // "town", "mine", "wilderness", "interior"
    private String size; // "small" (15x10), "medium" (30x20), "large" (50x30)
    private String theme; // "combat", "exploration", "social"
    private List<String> features; // ["water", "buildings", "cover", "elevation"]
}
```

**2. New DTO: MapGenerationResponse.java**
```java
public class MapGenerationResponse {
    private String name;
    private MapSize size;
    private List<TerrainTile> terrain;
    private List<BuildingData> buildings;
    private List<NPCData> npcs;
    private List<CoverData> cover;
    private String description;
}
```

**3. Update AIGameMasterService.java**
```java
public String generateBattleMap(MapGenerationRequest request) {
    String prompt = """
        Generate a tactical battle map for Deadlands Reloaded.

        Type: %s
        Size: %s tiles (%s)
        Theme: %s
        Features: %s

        Return a JSON object with this structure:
        {
          "name": "Map name",
          "size": { "width": 30, "height": 20 },
          "terrain": [
            { "type": "dirt|rocks|water|grass|wood_floor", "coords": [[x,y], ...] }
          ],
          "buildings": [
            {
              "name": "Building name",
              "type": "saloon|house|barn|mine|fort",
              "position": { "x": 5, "y": 3 },
              "size": { "width": 4, "height": 3 },
              "wallTerrain": "wood_wall|stone_wall",
              "floorTerrain": "wood_floor",
              "entrances": [{ "x": 7, "y": 6, "direction": "south" }]
            }
          ],
          "npcs": [
            {
              "name": "NPC name and role",
              "position": { "x": 10, "y": 10 },
              "personality": "Brief description"
            }
          ],
          "cover": [
            {
              "type": "barrel|crate|wagon|fence",
              "position": { "x": 5, "y": 5 },
              "coverBonus": 2,
              "size": "small|medium|large"
            }
          ],
          "description": "2-3 sentence tactical description"
        }

        Terrain types available: dirt, rocks, water, grass, sand, wood_floor, stone_floor
        Make it tactically interesting with chokepoints, cover, and elevation.
        """.formatted(request.getLocationType(), request.getSize(), ...);

    return callClaude(prompt);
}
```

**4. New Controller Endpoint**
```java
@PostMapping("/generate-map")
@PreAuthorize("hasRole('GAME_MASTER')")
public ResponseEntity<AIResponse> generateMap(@Valid @RequestBody MapGenerationRequest request) {
    String mapJson = aiGameMasterService.generateBattleMap(request);
    return ResponseEntity.ok(new AIResponse(mapJson));
}
```

#### Frontend Changes

**5. New Component: MapGeneratorTab.tsx**
```tsx
export default function MapGeneratorTab({ ... }) {
  const [locationType, setLocationType] = useState('wilderness');
  const [size, setSize] = useState('medium');
  const [theme, setTheme] = useState('combat');
  const [generatedMap, setGeneratedMap] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    const response = await aiService.generateMap({
      locationType,
      size,
      theme,
      features: ['water', 'buildings', 'cover']
    });

    // Parse JSON response
    const mapData = JSON.parse(response.content);
    setGeneratedMap(mapData);

    // Option 1: Download as JSON file
    downloadJSON(mapData, `${mapData.name}.json`);

    // Option 2: Send to Phaser for preview
    // gameEvents.emit('loadGeneratedMap', mapData);
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Location Type</InputLabel>
        <Select value={locationType} onChange={...}>
          <MenuItem value="wilderness">Wilderness</MenuItem>
          <MenuItem value="town">Town Street</MenuItem>
          <MenuItem value="interior">Building Interior</MenuItem>
          <MenuItem value="mine">Mine/Cave</MenuItem>
          <MenuItem value="fort">Fort/Compound</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Map Size</InputLabel>
        <Select value={size} onChange={...}>
          <MenuItem value="small">Small (15x10 tiles)</MenuItem>
          <MenuItem value="medium">Medium (30x20 tiles)</MenuItem>
          <MenuItem value="large">Large (50x30 tiles)</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Battle Theme</InputLabel>
        <Select value={theme} onChange={...}>
          <MenuItem value="combat">Combat (lots of cover)</MenuItem>
          <MenuItem value="chase">Chase (open spaces)</MenuItem>
          <MenuItem value="ambush">Ambush (asymmetric)</MenuItem>
          <MenuItem value="siege">Siege (defensible position)</MenuItem>
        </Select>
      </FormControl>

      <Button onClick={handleGenerate}>
        Generate Map
      </Button>

      {generatedMap && (
        <Box>
          <Typography variant="h6">{generatedMap.name}</Typography>
          <Typography>{generatedMap.description}</Typography>

          {/* Map preview (ASCII or mini canvas) */}
          <MapPreview data={generatedMap} />

          <Button onClick={() => downloadJSON(generatedMap)}>
            Download JSON
          </Button>
          <Button onClick={() => loadInPhaser(generatedMap)}>
            Load in Game
          </Button>
        </Box>
      )}
    </Box>
  );
}
```

**6. Add Map Tab to AIAssistantPanel.tsx**
```tsx
<Tab icon={<MapIcon />} label="Map Gen" value="mapgen" />

{mode === 'mapgen' && isGM && (
  <MapGeneratorTab ... />
)}
```

**7. Phaser Map Loader**
```typescript
// In Phaser scene
loadGeneratedMap(mapData: GeneratedMapData) {
  const { terrain, buildings, npcs, cover } = mapData;

  // Clear existing map
  this.clearMap();

  // Render terrain
  terrain.forEach(terrainGroup => {
    terrainGroup.coords.forEach(([x, y]) => {
      this.addTile(terrainGroup.type, x, y);
    });
  });

  // Render buildings
  buildings.forEach(building => {
    this.createBuilding(building);
  });

  // Spawn NPCs
  npcs.forEach(npc => {
    this.spawnNPC(npc);
  });

  // Place cover objects
  cover.forEach(coverObj => {
    this.placeCover(coverObj);
  });
}
```

---

### Phase 2: Enhanced Features (Optional)

**Elevation/Height Mapping**
- Add elevation data to terrain
- Render with color tints (darker = lower)
- Combat modifiers for high ground

**Dynamic Weather/Time of Day**
- AI suggests appropriate lighting
- Fog, rain, night settings
- Affects illumination system

**Save/Load Maps**
- Store generated maps in database
- GM library of generated maps
- Reuse maps across sessions

**Map Templates**
- Pre-defined structure types
- GM can customize after generation
- "Saloon Interior", "Fort Layout", etc.

---

## Cost Analysis

### Claude-Only Approach (Recommended)

**Per Map:**
- Input: ~500 tokens (prompt) = $0.0015
- Output: ~1000 tokens (JSON) = $0.015
- **Total: ~$0.017 per map**

**Monthly Estimate:**
- 50 maps generated: $0.85
- 100 maps: $1.70
- 200 maps: $3.40

**Very affordable!** 💰

---

## Alternative: Add Visual Artwork

If you want pretty background images too:

### Stable Diffusion API (Stability.ai)

**Cost:** $0.002-0.01 per 512x512 image

**Usage:**
1. Claude generates map JSON (game data)
2. Stable Diffusion generates top-down artwork (aesthetic)
3. Phaser layers gameplay elements over artwork

**Prompt Example:**
```
"Top-down view of a Wild West mining camp, dirt roads, wooden buildings,
rocky terrain, creek, pixel art style, game map, orthographic view"
```

**Integration:**
```typescript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${STABILITY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text_prompts: [{ text: prompt }],
    cfg_scale: 7,
    height: 1024,
    width: 1024,
    samples: 1,
    steps: 30
  })
});
```

**Total cost per map:** $0.017 (Claude) + $0.01 (SD) = **$0.027**

Still very cheap!

---

## Comparison Table

| Approach | Cost/Map | Quality | Game-Ready | Integration Effort |
|----------|----------|---------|------------|-------------------|
| **Claude JSON → Phaser** | $0.017 | Good | ✅ Yes | Low (2-4 hrs) |
| Claude + Stable Diffusion | $0.027 | Excellent | ✅ Yes | Medium (6-8 hrs) |
| DALL-E 3 only | $0.04-0.08 | Beautiful | ❌ No | High (manual processing) |
| Self-hosted SD | $0.017 | Excellent | ✅ Yes | Very High (GPU server) |

---

## Recommended Path Forward

### **Start with Claude JSON (Phase 1)**

**Why:**
1. Low cost ($0.017/map)
2. Fast to implement (2-4 hours)
3. Works with your existing Phaser engine
4. Game-ready immediately
5. Easy to test and iterate

**Later: Add Stable Diffusion backgrounds (Phase 2)**
- Only if you want prettier maps
- Adds ~$0.01 per map
- Can be optional (GM chooses)

---

## Example Generated Map

**GM Input:**
- Type: Town Street
- Size: Medium
- Theme: Shootout
- Features: Cover, Buildings

**Claude Output:**
```json
{
  "name": "Main Street Shootout",
  "size": { "width": 30, "height": 20 },
  "description": "A dusty main street lined with wooden buildings. Barrels and wagons provide cover. The saloon dominates the east end.",

  "terrain": [
    { "type": "dirt", "coords": [[0,0], [1,0], ..., [29,19]] },
    { "type": "wood_floor", "coords": [[5,3], [6,3], ...] }
  ],

  "buildings": [
    {
      "name": "Dead Man's Hand Saloon",
      "type": "saloon",
      "position": { "x": 20, "y": 5 },
      "size": { "width": 8, "height": 10 },
      "wallTerrain": "wood_wall",
      "floorTerrain": "wood_floor",
      "entrances": [
        { "x": 24, "y": 5, "direction": "north" },
        { "x": 20, "y": 10, "direction": "west" }
      ]
    },
    {
      "name": "General Store",
      "type": "store",
      "position": { "x": 5, "y": 5 },
      "size": { "width": 6, "height": 8 }
    }
  ],

  "cover": [
    { "type": "barrel", "position": { "x": 10, "y": 10 }, "coverBonus": 2 },
    { "type": "wagon", "position": { "x": 15, "y": 8 }, "coverBonus": 4 },
    { "type": "water_trough", "position": { "x": 12, "y": 12 }, "coverBonus": 2 }
  ],

  "npcs": [
    {
      "name": "Sheriff Daniels",
      "position": { "x": 8, "y": 10 },
      "personality": "Tough lawman, quick draw"
    }
  ]
}
```

**Phaser renders this** using your existing tile system!

---

## API Keys & Setup

### Claude (Already Have)
- ✅ Already configured
- ✅ Works in production
- No additional setup needed

### Stable Diffusion (Optional - Phase 2)
**Option A: Stability.ai API**
- Sign up: https://platform.stability.ai/
- API key: Free tier → $10 credit
- Cost: $0.002-0.01 per image

**Option B: Replicate.com**
- Sign up: https://replicate.com/
- Pay-as-you-go
- Cost: $0.0023 per image
- Easier API, good docs

**Option C: Self-hosted**
- Free but needs GPU server
- Railway doesn't support GPU yet
- Would need separate server (expensive)

---

## Next Steps

### To Implement Phase 1 (Claude JSON Maps):

1. **Backend:** Add map generation endpoint (~1 hour)
2. **Frontend:** Add Map Generator tab (~2 hours)
3. **Phaser:** Add JSON map loader (~1 hour)
4. **Test:** Generate 5-10 maps, verify quality

**Total time:** ~4 hours
**Total cost:** $0 (uses existing Claude API)

### To Add Phase 2 (Stable Diffusion):

5. **Sign up:** Stability.ai or Replicate
6. **Backend:** Add image generation service (~1 hour)
7. **Frontend:** Display generated images (~1 hour)
8. **Test:** Generate maps with artwork

**Additional time:** ~2 hours
**Cost:** ~$0.01 per map image

---

## Questions to Consider

1. **Do you want Phase 1 only (JSON maps)?**
   - Pros: Cheap, fast, game-ready
   - Cons: Uses existing tiles (less visually unique)

2. **Do you want Phase 2 (AI artwork backgrounds)?**
   - Pros: Beautiful, unique maps
   - Cons: +$0.01 per map, more complex

3. **Map storage?**
   - Should generated maps be saved to database?
   - Or just downloaded as JSON files?

4. **Preview in AI window?**
   - Show ASCII/emoji preview of map?
   - Or just download JSON for loading in game?

---

## My Recommendation

**Start with Phase 1 (Claude JSON only)**

Reasons:
1. **Fast to build:** 4 hours
2. **Very cheap:** $0.017/map
3. **Immediately useful:** GM can generate tactical maps
4. **Proves the concept:** Test if GMs actually use it
5. **Foundation:** Easy to add SD artwork later if desired

**Then add Phase 2 later** if GMs love it and want prettier maps.

---

**Ready to proceed? Let me know if you want me to implement Phase 1!**
