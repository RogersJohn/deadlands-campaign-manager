import { DiceRoller } from './DiceRoller';
import { rollSavageWorldsDice, calculateDamageWithRaises, rollDamage } from './SavageWorldsRules';
import { GameCharacter, GameEnemy, CombatLogEntry, DiceRollEvent, CalledShotTarget } from '../types/GameTypes';

export type TurnPhase = 'player' | 'enemy' | 'victory' | 'defeat';

// Called shot modifiers per Savage Worlds rules
export const CALLED_SHOT_MODIFIERS = {
  head: { toHit: -4, damageBonus: 4, description: 'Head Shot' },
  vitals: { toHit: -4, damageBonus: 4, description: 'Vital Shot' },
  limb: { toHit: -2, damageBonus: 0, description: 'Limb Shot' },
  small: { toHit: -2, damageBonus: 0, description: 'Small Target' },
  tiny: { toHit: -4, damageBonus: 0, description: 'Tiny Target' },
};

export class CombatManager {
  private turnNumber = 1;
  private currentPhase: TurnPhase = 'player';
  private combatLog: CombatLogEntry[] = [];
  private playerHealth: number;
  private playerMaxHealth: number;
  private playerWounds = 0;
  private playerShaken = false;

  // Phase 1: Ranged Combat Modifiers
  private playerAiming = false; // +2 to next ranged attack
  private calledShotTarget: CalledShotTarget = null; // Target for called shot
  private playerHasRun = false; // Whether player ran this turn

  constructor(
    private character: GameCharacter,
    private onLogUpdate: (log: CombatLogEntry[]) => void,
    private onPhaseChange: (phase: TurnPhase, turn: number) => void,
    private onDiceRoll?: (roll: DiceRollEvent) => void
  ) {
    // Calculate player health from Vigor (Savage Worlds: Vigor die size = Wounds)
    this.playerMaxHealth = this.getMaxHealthFromVigor(character.vigorDie);
    this.playerHealth = this.playerMaxHealth;

    this.addLog(`Combat begins! ${character.name} vs enemies!`, 'info');
    this.addLog(`Your turn - Move and Attack`, 'info');
  }

  private getMaxHealthFromVigor(vigorDie: string): number {
    // In Savage Worlds, you can take 3 wounds before incapacitation
    // Each wound is triggered when damage exceeds Toughness
    // For simplicity: base health = Toughness * 3
    return (this.character.toughness || 6) * 3;
  }

  public getCurrentPhase(): TurnPhase {
    return this.currentPhase;
  }

  public getTurnNumber(): number {
    return this.turnNumber;
  }

  public getPlayerHealth(): number {
    return this.playerHealth;
  }

  public getPlayerMaxHealth(): number {
    return this.playerMaxHealth;
  }

  public getCombatLog(): CombatLogEntry[] {
    return this.combatLog;
  }

  public getPlayerWounds(): number {
    return this.playerWounds;
  }

  public getPlayerShaken(): boolean {
    return this.playerShaken;
  }

  public setPlayerShaken(shaken: boolean) {
    this.playerShaken = shaken;
  }

  // Phase 1: Aim action methods
  public setPlayerAiming(aiming: boolean) {
    this.playerAiming = aiming;
    if (aiming) {
      this.addLog('Taking careful aim... (+2 to next ranged attack)', 'info');
    }
  }

  public getPlayerAiming(): boolean {
    return this.playerAiming;
  }

  // Phase 1: Called shot methods
  public setCalledShotTarget(target: CalledShotTarget) {
    this.calledShotTarget = target;
    if (target && target in CALLED_SHOT_MODIFIERS) {
      const mod = CALLED_SHOT_MODIFIERS[target];
      this.addLog(`Called Shot: ${mod.description} (${mod.toHit} to hit, +${mod.damageBonus} damage)`, 'info');
    }
  }

  public getCalledShotTarget(): CalledShotTarget {
    return this.calledShotTarget;
  }

  // Phase 1: Running state methods
  public setPlayerHasRun(hasRun: boolean) {
    this.playerHasRun = hasRun;
  }

  public getPlayerHasRun(): boolean {
    return this.playerHasRun;
  }

  private addLog(message: string, type: 'info' | 'success' | 'damage' | 'miss') {
    const entry: CombatLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      message,
      type,
    };
    this.combatLog.push(entry);
    this.onLogUpdate([...this.combatLog]);
  }

  /**
   * Player attacks an enemy using Savage Worlds combat rules
   * PHASE 1: Now includes aim bonus, called shot, running target, and range penalties
   */
  public playerAttackEnemy(enemy: GameEnemy, weapon: { name: string; damage?: string; rangePenalty?: number; range?: string } = { name: 'Fists', damage: 'Str+d4', rangePenalty: 0 }, distance: number = 1): { hit: boolean; rollDetails?: string } {
    // Determine if ranged attack and if in melee range
    const isRangedWeapon = weapon.range !== undefined;
    const isInMeleeRange = distance <= 1;

    // PHASE 1: Calculate all modifiers
    const rangePenalty = weapon.rangePenalty || 0;
    const woundPenalty = this.playerWounds * -1;
    const aimBonus = this.playerAiming && isRangedWeapon ? 2 : 0;
    const runningPenalty = enemy.hasRun ? -2 : 0;
    const calledShotMod = this.calledShotTarget && this.calledShotTarget in CALLED_SHOT_MODIFIERS
      ? CALLED_SHOT_MODIFIERS[this.calledShotTarget]
      : null;
    const calledShotPenalty = calledShotMod?.toHit || 0;

    // Build attack description with all modifiers
    const modifiers: string[] = [];
    if (rangePenalty < 0) modifiers.push(`range ${rangePenalty}`);
    if (woundPenalty < 0) modifiers.push(`wounds ${woundPenalty}`);
    if (aimBonus > 0) modifiers.push(`aim +${aimBonus}`);
    if (runningPenalty < 0) modifiers.push(`running target -2`);
    if (calledShotPenalty < 0) modifiers.push(`${calledShotMod?.description} ${calledShotPenalty}`);

    const modText = modifiers.length > 0 ? ` (${modifiers.join(', ')})` : '';
    this.addLog(`${this.character.name} attacks ${enemy.name} with ${weapon.name}${modText}!`, 'info');

    // Savage Worlds Rule: Parry only applies to ranged attacks if attacker is within melee range
    let attackSkill: string;
    let attackDie: string;
    let targetNumber: number;
    let attackPurpose: string;

    if (isRangedWeapon) {
      // Ranged attack: Use Shooting/Throwing skill
      const shootingSkill = this.character.skills?.find(s =>
        s.name.toLowerCase().includes('shooting') || s.name.toLowerCase().includes('throwing')
      );
      attackDie = shootingSkill?.dieValue || '1d6';
      attackSkill = shootingSkill?.name || 'Shooting';
      attackPurpose = `${attackSkill} Attack`;

      // Ranged: Use Parry only if in melee range, otherwise use base target 4
      targetNumber = isInMeleeRange ? enemy.parry : 4;
    } else {
      // Melee attack: Use Fighting skill vs Parry
      const fightingSkill = this.character.skills?.find(s => s.name.toLowerCase().includes('fighting'));
      attackDie = fightingSkill?.dieValue || '1d6';
      attackSkill = 'Fighting';
      attackPurpose = 'Fighting Attack';
      targetNumber = enemy.parry;
    }

    // PHASE 1: Combine all modifiers
    const totalModifier = woundPenalty + rangePenalty + aimBonus + runningPenalty + calledShotPenalty;

    const attackRoll = rollSavageWorldsDice(
      attackDie,
      true, // Player is a Wild Card
      totalModifier, // Wound penalty + range penalty
      targetNumber
    );

    // Emit attack roll
    if (this.onDiceRoll) {
      this.onDiceRoll({
        id: `${Date.now()}-attack`,
        timestamp: Date.now(),
        roller: this.character.name,
        purpose: attackPurpose,
        dieType: attackDie,
        rolls: attackRoll.rolls,
        wildDie: attackRoll.wildDie,
        total: attackRoll.total,
        exploded: attackRoll.exploded,
        targetNumber: targetNumber,
        raises: attackRoll.raises,
      });
    }

    // Check if hit
    const targetText = (isRangedWeapon && !isInMeleeRange) ? `TN ${targetNumber}` : `Parry ${targetNumber}`;

    if (attackRoll.total < targetNumber) {
      this.addLog(`Miss! (Rolled ${attackRoll.total} vs ${targetText})`, 'miss');
      return { hit: false, rollDetails: `🎲 ${attackRoll.total}` };
    }

    this.addLog(`Hit! (Rolled ${attackRoll.total} vs ${targetText})${attackRoll.raises > 0 ? ` with ${attackRoll.raises} raise(s)!` : ''}`, 'success');

    // Step 2: Roll damage using Savage Worlds damage calculation
    const damageResult = calculateDamageWithRaises(
      this.character.strengthDie || '1d6',
      weapon.damage || 'Str+d4',
      attackRoll.raises
    );

    // PHASE 1: Apply called shot damage bonus
    let finalDamage = damageResult.totalDamage;
    if (calledShotMod && calledShotMod.damageBonus > 0) {
      finalDamage += calledShotMod.damageBonus;
      this.addLog(`${calledShotMod.description}! (+${calledShotMod.damageBonus} damage)`, 'success');
    }

    // Emit damage rolls
    if (this.onDiceRoll) {
      this.onDiceRoll({
        id: `${Date.now()}-damage`,
        timestamp: Date.now(),
        roller: this.character.name,
        purpose: 'Damage',
        dieType: weapon.damage || 'Str+d4',
        rolls: [damageResult.totalDamage],
        total: finalDamage,
        exploded: false,
      });
    }

    // Step 3: Compare damage to enemy Toughness
    const woundsDealt = finalDamage >= enemy.toughness
      ? Math.floor((finalDamage - enemy.toughness) / 4) + 1
      : 0;

    if (woundsDealt > 0) {
      const actualDamage = woundsDealt * 4;
      enemy.health = Math.max(0, enemy.health - actualDamage);

      this.addLog(
        `💥 Damage: ${finalDamage} vs Toughness ${enemy.toughness} = ${woundsDealt} wound(s)!`,
        'success'
      );
      this.addLog(`${enemy.name}: ${enemy.health}/${enemy.maxHealth} HP`, 'damage');

      if (enemy.health <= 0) {
        this.addLog(`${enemy.name} is defeated!`, 'success');
      }

      // PHASE 1: Clear aim and called shot after attack
      this.playerAiming = false;
      this.calledShotTarget = null;

      const rollDetails = `🎲 Attack: ${attackRoll.total}\n💥 Damage: ${finalDamage}`;
      return { hit: true, rollDetails };
    } else {
      this.addLog(`Shaken but no wounds! (Damage ${finalDamage} vs Toughness ${enemy.toughness})`, 'miss');

      // PHASE 1: Clear aim and called shot after attack (even on miss)
      this.playerAiming = false;
      this.calledShotTarget = null;

      return { hit: false, rollDetails: `🎲 ${attackRoll.total}\n💥 ${finalDamage}` };
    }
  }

  /**
   * Enemy attacks player
   */
  public enemyAttackPlayer(enemy: GameEnemy): boolean {
    this.addLog(`${enemy.name} attacks ${this.character.name}!`, 'info');

    // Fighting roll vs player's Parry (enemy is NOT a Wild Card)
    const attackRoll = rollSavageWorldsDice(
      enemy.fightingDie,
      false, // Enemy is NOT a Wild Card
      0, // No modifiers for now
      this.character.parry || 2
    );

    if (attackRoll.total < (this.character.parry || 2)) {
      this.addLog(`${enemy.name} misses! (Rolled ${attackRoll.total} vs Parry ${this.character.parry})`, 'miss');
      return false;
    }

    this.addLog(`${enemy.name} hits! (Rolled ${attackRoll.total} vs Parry ${this.character.parry})${attackRoll.raises > 0 ? ` with ${attackRoll.raises} raise(s)!` : ''}`, 'damage');

    // Roll damage
    const damageResult = calculateDamageWithRaises(
      enemy.strengthDie,
      'Str', // Just strength for unarmed
      attackRoll.raises
    );

    // Compare to player Toughness
    const woundsDealt = damageResult.totalDamage >= (this.character.toughness || 2)
      ? Math.floor((damageResult.totalDamage - (this.character.toughness || 2)) / 4) + 1
      : 0;

    if (woundsDealt > 0) {
      this.playerWounds += woundsDealt;
      const actualDamage = woundsDealt * 4;
      this.playerHealth = Math.max(0, this.playerHealth - actualDamage);

      this.addLog(
        `💥 Damage: ${damageResult.totalDamage} vs Toughness ${this.character.toughness} = ${woundsDealt} wound(s)!`,
        'damage'
      );
      this.addLog(`You: ${this.playerHealth}/${this.playerMaxHealth} HP | Wounds: ${this.playerWounds}`, 'damage');

      if (this.playerWounds >= 3) {
        this.addLog('You are INCAPACITATED!', 'damage');
        this.currentPhase = 'defeat';
        this.onPhaseChange(this.currentPhase, this.turnNumber);
      }

      return true;
    } else if (damageResult.totalDamage >= (this.character.toughness || 2) - 4) {
      // Even if no wounds, they might be shaken
      this.playerShaken = true;
      this.addLog(`You are SHAKEN! (Damage ${damageResult.totalDamage} vs Toughness ${this.character.toughness})`, 'damage');
      return true;
    } else {
      this.addLog(`No effect! (Damage ${damageResult.totalDamage} vs Toughness ${this.character.toughness})`, 'miss');
      return false;
    }
  }

  /**
   * End player turn and start enemy turn
   */
  public endPlayerTurn() {
    this.addLog('--- End Player Turn ---', 'info');

    // PHASE 1: Clear running flag for player
    this.playerHasRun = false;

    this.currentPhase = 'enemy';
    this.onPhaseChange(this.currentPhase, this.turnNumber);
  }

  /**
   * End enemy turn and start new player turn
   * PHASE 1: Clear running flags for all enemies at start of new turn
   */
  public endEnemyTurn(enemies?: GameEnemy[]) {
    this.turnNumber++;

    // PHASE 1: Clear running flags for all enemies
    if (enemies) {
      enemies.forEach(enemy => {
        enemy.hasRun = false;
      });
    }

    this.addLog(`--- Turn ${this.turnNumber} - Your Turn ---`, 'info');
    this.currentPhase = 'player';
    this.onPhaseChange(this.currentPhase, this.turnNumber);
  }

  /**
   * Check victory condition
   */
  public checkVictory(enemies: GameEnemy[]): boolean {
    const allDefeated = enemies.every(e => e.health <= 0);
    if (allDefeated && this.currentPhase !== 'victory') {
      this.addLog('Victory! All enemies defeated!', 'success');
      this.currentPhase = 'victory';
      this.onPhaseChange(this.currentPhase, this.turnNumber);
      return true;
    }
    return false;
  }
}
