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
@RequestMapping("/api/characters")
public class CharacterController {

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Character>> getAllCharacters(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == User.Role.GAME_MASTER) {
            return ResponseEntity.ok(characterRepository.findAll());
        } else {
            return ResponseEntity.ok(characterRepository.findByPlayerId(user.getId()));
        }
    }

    @GetMapping("/{id}")
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
