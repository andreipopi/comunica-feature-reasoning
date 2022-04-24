import { ActorRdfReason, IActionRdfReason, IActorRdfReasonOutput, IActorRdfReasonArgs, ActorRdfReasonMediated, IActorRdfReasonMediatedArgs, IActionRdfReasonExecute } from '@comunica/bus-rdf-reason';
import { IActorArgs, IActorTest } from '@comunica/core';
import { MediatorRuleEvaluate } from '@comunica/bus-rule-evaluate'
import { union, AsyncIterator, single, empty, fromArray } from 'asynciterator';
import { Quad } from '@rdfjs/types';
import { IActionContext } from '@comunica/types';
import { INestedPremiseConclusionRule, IPremiseConclusionRule, Rule } from '@comunica/reasoning-types';
import { maybeIterator } from './util'
import { MediatorRdfUpdateQuadsInfo } from '@comunica/bus-rdf-update-quads-info';
import { MediatorRdfUpdateQuads } from '@comunica/bus-rdf-update-quads';

interface IRuleNode {
  rule: Rule;
  next: { rule: IRuleNode, index: number }[];
}

function maybeSubstitute(rule: { rule: IRuleNode, index: number }, quad: Quad): IRuleNode {
  throw new Error('not implemented')
}

/**
 * A comunica Forward Chaining RDF Reason Actor.
 */
export class ActorRdfReasonForwardChaining extends ActorRdfReasonMediated {
  mediatorRuleEvaluate: MediatorRuleEvaluate;
  mediatorRdfUpdateQuadsInfo: MediatorRdfUpdateQuadsInfo;

  public constructor(args: IActorRdfReasonForwardChainingArgs) {
    super(args);
  }

  public async test(action: IActionRdfReason): Promise<IActorTest> {
    return true; // TODO implement
  }

  // This should probably be a mediator of its own
  private async evaluateInsert(rule: IRuleNode, context: IActionContext): Promise<AsyncIterator<{ quads: AsyncIterator<Quad>, rule: IRuleNode }>> {
    const { results } = await this.mediatorRuleEvaluate.mediate({ rule: rule.rule, context });
    const { execute } = await this.mediatorRdfUpdateQuadsInfo.mediate({
      context, quadStreamInsert: results, ignoreSourceComparison: false
    });
    const { quadStreamInsert } = await execute();
    return quadStreamInsert ? single({ quads: quadStreamInsert, rule }) : empty();
  }

  private async fullyEvaluateRule(_rule: IRuleNode, context: IActionContext) {
    let results: AsyncIterator<{
      quads: AsyncIterator<Quad>;
      rule: IRuleNode;
    }>| null = await this.evaluateInsert(_rule, context);

    while ((results = await maybeIterator(results)) !== null) {
      results = union(results.map(({ quads, rule }) => {
        const newRules = union(quads.map(quad => fromArray(rule.next).map(rule => maybeSubstitute(rule, quad))));
        // TODO: Wrap this once the wrap promise is available
        return newRules.map(rule => this.evaluateInsert(rule, context))
        
        // return this.evaluateInsert(rule, );

        // return union(quads.map(quad => fromArray(rule.next).map(rule => maybeSubstute(rule, quad))))
        //   .map(rule => this.evaluateInsert(rule, ));
      }));
    }
  }

  private evaluateRules(rules: Rule[], context: IActionContext, quadStream?: AsyncIterator<Quad>): AsyncIterator<Quad> {
    return union(rules.map(
      rule => this.mediatorRuleEvaluate.mediate(({ rule, context, quadStream })).then(res => res.results)
    ));
  }

  public async execute({ rules, context }: IActionRdfReasonExecute): Promise<void> {
    // Get the initial stream of reasoning results
    const quadStream = this.evaluateInsert(rules, context);
    // Continue to apply reasoning using only the new results
    
    
    maybeIterator()
    quadStream.filter()
  }

  // public async execute({ rules, context }: IActionRdfReasonExecute): Promise<void> {
  //   // Get the initial stream of reasoning results
  //   const quadStream = this.evaluateRules(rules, context);
  //   // Continue to apply reasoning using only the new results
    
    
  //   maybeIterator()
  //   quadStream.filter()
  // }
}

export interface IActorRdfReasonForwardChainingArgs extends IActorRdfReasonMediatedArgs {
  mediatorRuleEvaluate: MediatorRuleEvaluate;
}
