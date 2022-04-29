import { ActorRdfReason, IActionRdfReason, IActorRdfReasonOutput, IActorRdfReasonArgs, ActorRdfReasonMediated, IActorRdfReasonMediatedArgs, IActionRdfReasonExecute } from '@comunica/bus-rdf-reason';
import { IActorArgs, IActorTest } from '@comunica/core';
import { MediatorRuleEvaluate } from '@comunica/bus-rule-evaluate'
import { union, AsyncIterator, single, empty, fromArray, EmptyIterator, ArrayIterator, UnionIterator } from 'asynciterator';
import { Quad } from '@rdfjs/types';
import { IActionContext } from '@comunica/types';
import { INestedPremiseConclusionRule, IPremiseConclusionRule, Rule } from '@comunica/reasoning-types';
import { maybeIterator, WrappingIterator } from './util'
import { MediatorRdfUpdateQuadsInfo } from '@comunica/bus-rdf-update-quads-info';
import { MediatorRdfUpdateQuads } from '@comunica/bus-rdf-update-quads';
import * as RDF from '@rdfjs/types';
import { forEachTerms } from 'rdf-terms';

interface IRuleNode {
  rule: Rule;
  next: { rule: IRuleNode, index: number }[];
}

interface IConsequenceData {
  quads: AsyncIterator<Quad>;
  rule: IRuleNode;
}

function maybeSubstitute({ rule: { rule }, index }: { rule: IRuleNode, index: number }, quad: Quad): IRuleNode {
  const mapping: Record<string, RDF.Term> = {};
  const term = rule.premise[index];

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
  private async evaluateInsert(rule: IRuleNode, context: IActionContext): Promise<AsyncIterator<RDF.Quad>> {
    const { results } = await this.mediatorRuleEvaluate.mediate({ rule: rule.rule, context });
    const { execute } = await this.mediatorRdfUpdateQuadsInfo.mediate({
      context, quadStreamInsert: results, filterSource: true
    });
    const { quadStreamInsert } = await execute();
    return quadStreamInsert ?? new ArrayIterator([], { autoStart: false });
  }

  private evaluteInsertRule(rule: IRuleNode, context: IActionContext): IConsequenceData {
    const quads: AsyncIterator<RDF.Quad> = new WrappingIterator(this.evaluateInsert(rule, context));
    return { quads, rule };
  }

  // private async evaluateInsert(rule: IRuleNode, context: IActionContext): Promise<AsyncIterator<IConsequenceData>> {
  //   const { results } = await this.mediatorRuleEvaluate.mediate({ rule: rule.rule, context });
  //   const { execute } = await this.mediatorRdfUpdateQuadsInfo.mediate({
  //     context, quadStreamInsert: results, filterSource: true
  //   });
  //   const { quadStreamInsert } = await execute();
  //   return quadStreamInsert ? single({ quads: quadStreamInsert, rule }) : empty();
  // }

  private async fullyEvaluateRule(_rule: IRuleNode, context: IActionContext) {
    let results: AsyncIterator<IConsequenceData> | null;
    results = single<IConsequenceData>(this.evaluteInsertRule(_rule, context));

    while ((results = await maybeIterator(results)) !== null) {
      results = union(results.map(({ quads, rule }) => {
        const newRules = new UnionIterator(quads.map(quad => fromArray(rule.next).map(rule => maybeSubstitute(rule, quad))), { autoStart: false });
        // TODO: Wrap this once the wrap promise is available
        return newRules.map(rule => this.evaluteInsertRule(rule, context));
      }));
      
      
      // results = union(results.map(({ quads, rule }) => {
      //   const newRules = union(quads.map(quad => fromArray(rule.next).map(rule => maybeSubstitute(rule, quad))));
      //   // TODO: Wrap this once the wrap promise is available
      //   return newRules.map(rule => this.evaluateInsert(rule, context))
        
      //   // return this.evaluateInsert(rule, );

      //   // return union(quads.map(quad => fromArray(rule.next).map(rule => maybeSubstute(rule, quad))))
      //   //   .map(rule => this.evaluateInsert(rule, ));
      // }));
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