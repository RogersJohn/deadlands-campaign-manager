package com.deadlands.campaign.controller;

import com.deadlands.campaign.model.Character;
import com.deadlands.campaign.model.User;
import com.deadlands.campaign.repository.CharacterRepository;
import com.deadlands.campaign.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/characters")
public class CharacterController {

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CharacterDTO>> getAllCharacters(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Character> characters;
        if (user.getRole() == User.Role.GAME_MASTER) {
            characters = characterRepository.findAll();
        } else {
            characters = characterRepository.findByPlayerId(user.getId());
        }

        List<CharacterDTO> characterDTOs = characters.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(characterDTOs);
    }

    private CharacterDTO toDTO(Character character) {
        CharacterDTO dto = new CharacterDTO();
        dto.setId(character.getId());
        dto.setName(character.getName());
        dto.setOccupation(character.getOccupation());
        dto.setPace(character.getPace());
        dto.setSize(character.getSize());
        dto.setWind(character.getWind());
        dto.setGrit(character.getGrit());
        dto.setCognitionDie(character.getCognitionDie());
        dto.setDeftnessDie(character.getDeftnessDie());
        dto.setNimblenessDie(character.getNimblenessDie());
        dto.setQuicknessDie(character.getQuicknessDie());
        dto.setSmartsDie(character.getSmartsDie());
        dto.setSpiritDie(character.getSpiritDie());
        dto.setStrengthDie(character.getStrengthDie());
        dto.setVigorDie(character.getVigorDie());
        dto.setNotes(character.getNotes());
        dto.setCharacterImageUrl(character.getCharacterImageUrl());
        dto.setIsNpc(character.getIsNpc());

        // Add player information
        if (character.getPlayer() != null) {
            dto.setPlayerId(character.getPlayer().getId());
            dto.setPlayerName(character.getPlayer().getUsername());
        }

        return dto;
    }

    static class CharacterDTO {
        private Long id;
        private String name;
        private String occupation;
        private Integer pace;
        private Integer size;
        private Integer wind;
        private Integer grit;
        private String cognitionDie;
        private String deftnessDie;
        private String nimblenessDie;
        private String quicknessDie;
        private String smartsDie;
        private String spiritDie;
        private String strengthDie;
        private String vigorDie;
        private String notes;
        private String characterImageUrl;
        private Boolean isNpc;
        private Long playerId;
        private String playerName;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getOccupation() { return occupation; }
        public void setOccupation(String occupation) { this.occupation = occupation; }
        public Integer getPace() { return pace; }
        public void setPace(Integer pace) { this.pace = pace; }
        public Integer getSize() { return size; }
        public void setSize(Integer size) { this.size = size; }
        public Integer getWind() { return wind; }
        public void setWind(Integer wind) { this.wind = wind; }
        public Integer getGrit() { return grit; }
        public void setGrit(Integer grit) { this.grit = grit; }
        public String getCognitionDie() { return cognitionDie; }
        public void setCognitionDie(String cognitionDie) { this.cognitionDie = cognitionDie; }
        public String getDeftnessDie() { return deftnessDie; }
        public void setDeftnessDie(String deftnessDie) { this.deftnessDie = deftnessDie; }
        public String getNimblenessDie() { return nimblenessDie; }
        public void setNimblenessDie(String nimblenessDie) { this.nimblenessDie = nimblenessDie; }
        public String getQuicknessDie() { return quicknessDie; }
        public void setQuicknessDie(String quicknessDie) { this.quicknessDie = quicknessDie; }
        public String getSmartsDie() { return smartsDie; }
        public void setSmartsDie(String smartsDie) { this.smartsDie = smartsDie; }
        public String getSpiritDie() { return spiritDie; }
        public void setSpiritDie(String spiritDie) { this.spiritDie = spiritDie; }
        public String getStrengthDie() { return strengthDie; }
        public void setStrengthDie(String strengthDie) { this.strengthDie = strengthDie; }
        public String getVigorDie() { return vigorDie; }
        public void setVigorDie(String vigorDie) { this.vigorDie = vigorDie; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getCharacterImageUrl() { return characterImageUrl; }
        public void setCharacterImageUrl(String characterImageUrl) { this.characterImageUrl = characterImageUrl; }
        public Boolean getIsNpc() { return isNpc; }
        public void setIsNpc(Boolean isNpc) { this.isNpc = isNpc; }
        public Long getPlayerId() { return playerId; }
        public void setPlayerId(Long playerId) { this.playerId = playerId; }
        public String getPlayerName() { return playerName; }
        public void setPlayerName(String playerName) { this.playerName = playerName; }
    }

    @GetMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Character> getCharacterById(@PathVariable Long id, Authentication authentication) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Character not found"));

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission to view this character
        if (user.getRole() != User.Role.GAME_MASTER &&
            !character.getPlayer().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Trigger lazy loading within transaction before returning
        character.getSkills().size();
        character.getEdges().size();
        character.getHindrances().size();
        character.getEquipment().size();
        character.getArcanePowers().size();
        character.getWounds().size();

        return ResponseEntity.ok(character);
    }

    @PostMapping
    public ResponseEntity<Character> createCharacter(@RequestBody Character character, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        character.setPlayer(user);
        Character savedCharacter = characterRepository.save(character);
        return ResponseEntity.ok(savedCharacter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Character> updateCharacter(@PathVariable Long id,
                                                      @RequestBody Character characterDetails,
                                                      Authentication authentication) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Character not found"));

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission to edit this character
        if (user.getRole() != User.Role.GAME_MASTER &&
            !character.getPlayer().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Update character fields
        character.setName(characterDetails.getName());
        character.setOccupation(characterDetails.getOccupation());
        character.setCognitionDie(characterDetails.getCognitionDie());
        character.setDeftnessDie(characterDetails.getDeftnessDie());
        character.setNimblenessDie(characterDetails.getNimblenessDie());
        character.setQuicknessDie(characterDetails.getQuicknessDie());
        character.setSmartsDie(characterDetails.getSmartsDie());
        character.setSpiritDie(characterDetails.getSpiritDie());
        character.setStrengthDie(characterDetails.getStrengthDie());
        character.setVigorDie(characterDetails.getVigorDie());
        character.setNotes(characterDetails.getNotes());

        Character updatedCharacter = characterRepository.save(character);
        return ResponseEntity.ok(updatedCharacter);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<?> deleteCharacter(@PathVariable Long id) {
        characterRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
