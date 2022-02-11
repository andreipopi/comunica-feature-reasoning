import type { MediatorNormalizeRule } from '@comunica/bus-normalize-rule';
import type { IActionOptimizeRule, IActorOptimizeRuleOutput } from '@comunica/bus-optimize-rule';
import { ActorOptimizeRule } from '@comunica/bus-optimize-rule';
import type { IActorArgs, IActorTest } from '@comunica/core';
import type * as RDF from '@rdfjs/types';
import { Writer } from 'n3';
import type { Rule } from '../../actor-rdf-reason-rule-restriction/lib/reasoner';

function toString(quads: RDF.Quad[]) {
  const writer = new Writer();
  writer.quadsToString(quads);
}

/**
 * A comunica Actor that Optimizes rules by merging those rules that have a shared premise
 */
export class ActorOptimizeRuleReconcilePremise extends ActorOptimizeRule {
  public readonly mediatorNormalizeRule: MediatorNormalizeRule;
  public constructor(args: IActorArgs<IActionOptimizeRule, IActorTest, IActorOptimizeRuleOutput>) {
    super(args);
  }

  public async test(action: IActionOptimizeRule): Promise<IActorTest> {
    // Check that the rules are normalized (perhaps via a metadata property)
    return true; // TODO implement
  }

  public async run(action: IActionOptimizeRule): Promise<IActorOptimizeRuleOutput> {
    const normalized = await this.mediatorNormalizeRule.mediate(action);

    const writer = new Writer();

    const map: Record<string, Rule[]> = {};

    for (const rule of normalized.rules) {
      (map[writer.quadsToString(rule.premise)] ??= []).push(rule);
    }

    const rules: Rule[] = [];

    for (const ruleSet of Object.values(map)) {
      if (ruleSet.length === 1) {
        rules.push(ruleSet[0]);
      } else {
        const conclusion = rules.reduce<RDF.Quad[] | false>((total, { conclusion }) => {
          if (conclusion === false || total === false) {
            return false;
          }
          return total.concat(conclusion);
        }, []);
        rules.push({
          premise: rules[0].premise,
          conclusion,
        });
      }
    }

    // This assumes that
    return { ...action, rules }; // TODO implement
  }
}

export interface IActorOptimizeRuleReconcilePremiseArgs extends IActorArgs<IActionOptimizeRule, IActorTest, IActorOptimizeRuleOutput> {
  mediatorNormalizeRule: MediatorNormalizeRule;
}