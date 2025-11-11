import { DiceRoller } from './DiceRoller';
import { rollSavageWorldsDice, calculateDamageWithRaises, rollDamage } from './SavageWorldsRules';
import { GameCharacter, GameEnemy, CombatLogEntry, DiceRollEvent } from '../types/GameTypes';

export type TurnPhase = 'player' | 'enemy' | 'victory' | 'defeat';

export class CombatManager {
  private turnNumber = 1;
  private currentPhase: TurnPhase = 'player';
  private combatLog: CombatLogEntry[] = [];
  private playerHealth: number;
  private playerMaxHealth: number;
  private playerWounds = 0;
  private playerShaken = false;

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
   */
  public playerAttackEnemy(enemy: GameEnemy, weapon: { name: string; damage?: string; rangePenalty?: number; range?: string } = { name: 'Fists', damage: 'Str+d4', rangePenalty: 0 }, distance: number = 1): { hit: boolean; rollDetails?: string } {
    const rangePenalty = weapon.rangePenalty || 0;
    const rangeText = rangePenalty < 0 ? ` at range (${rangePenalty})` : '';
    this.addLog(`${this.character.name} attacks ${enemy.name} with ${weapon.name}${rangeText}!`, 'info');

    // Determine if ranged attack and if in melee range
    const isRangedWeapon = weapon.range !== undefined;
    const isInMeleeRange = distance <= 1;

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

    // Combine wound penalty and range penalty
    const totalModifier = (this.playerWounds * -1) + rangePenalty;

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

    // Emit damage rolls
    if (this.onDiceRoll) {
      this.onDiceRoll({
        id: `${Date.now()}-damage`,
        timestamp: Date.now(),
        roller: this.character.name,
        purpose: 'Damage',
        dieType: weapon.damage || 'Str+d4',
        rolls: [damageResult.totalDamage],
        total: damageResult.totalDamage,
        exploded: false,
      });
    }

    // Step 3: Compare damage to enemy Toughness
    const woundsDealt = damageResult.totalDamage >= enemy.toughness
      ? Math.floor((damageResult.totalDamage - enemy.toughness) / 4) + 1
      : 0;

    if (woundsDealt > 0) {
      const actualDamage = woundsDealt * 4;
      enemy.health = Math.max(0, enemy.health - actualDamage);

      this.addLog(
        `💥 Damage: ${damageResult.totalDamage} vs Toughness ${enemy.toughness} = ${woundsDealt} wound(s)!`,
        'success'
      );
      this.addLog(`${enemy.name}: ${enemy.health}/${enemy.maxHealth} HP`, 'damage');

      if (enemy.health <= 0) {
        this.addLog(`${enemy.name} is defeated!`, 'success');
      }

      const rollDetails = `🎲 Attack: ${attackRoll.total}\n💥 Damage: ${damageResult.totalDamage}`;
      return { hit: true, rollDetails };
    } else {
      this.addLog(`Shaken but no wounds! (Damage ${damageResult.totalDamage} vs Toughness ${enemy.toughness})`, 'miss');
      return { hit: false, rollDetails: `🎲 ${attackRoll.total}\n💥 ${damageResult.totalDamage}` };
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
    this.currentPhase = 'enemy';
    this.onPhaseChange(this.currentPhase, this.turnNumber);
  }

  /**
   * End enemy turn and start new player turn
   */
  public endEnemyTurn() {
    this.turnNumber++;
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
