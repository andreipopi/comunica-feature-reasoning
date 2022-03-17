import type { MediatorOptimizeRule } from '@comunica/bus-optimize-rule';
import type { IActorRdfResolveQuadPatternArgs, IActorRdfResolveQuadPatternOutput, MediatorRdfResolveQuadPattern } from '@comunica/bus-rdf-resolve-quad-pattern';
import type {
  IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput, MediatorRdfUpdateQuads,
} from '@comunica/bus-rdf-update-quads';
import type { MediatorRuleResolve } from '@comunica/bus-rule-resolve';
import type { IActorArgs, IActorTest } from '@comunica/core';
import type { Rule } from '@comunica/reasoning-types';
import type { IActionContext } from '@comunica/types';
import type * as RDF from '@rdfjs/types';
import { wrap, type AsyncIterator } from 'asynciterator';
import type { Algebra } from 'sparqlalgebrajs';
import type { IActionRdfReason, IActorRdfReasonOutput } from './ActorRdfReason';
import { ActorRdfReason, setImplicitDestination, setImplicitSource, setUnionSource } from './ActorRdfReason';

export abstract class ActorRdfReasonMediated extends ActorRdfReason implements IActorRdfReasonMediatedArgs {
  public readonly mediatorRdfUpdateQuads: MediatorRdfUpdateQuads;

  public readonly mediatorRdfResolveQuadPattern: MediatorRdfResolveQuadPattern;

  public readonly mediatorRuleResolve: MediatorRuleResolve;

  public readonly mediatorOptimizeRule: MediatorOptimizeRule;

  public constructor(args: IActorRdfReasonMediatedArgs) {
    super(args);
  }

  protected async runExplicitUpdate(changes: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    return this.mediatorRdfUpdateQuads.mediate(changes);
  }

  protected async runImplicitUpdate(action: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    return this.runExplicitUpdate({ ...action, context: setImplicitDestination(action.context) });
  }

  protected explicitQuadSource(context: IActionContext): { match: (pattern: Algebra.Pattern) => AsyncIterator<RDF.Quad> } {
    return {
      match: (pattern: Algebra.Pattern): AsyncIterator<RDF.Quad> => wrap(
        this.mediatorRdfResolveQuadPattern.mediate({ context, pattern }).then(({ data }) => data),
      ),
    };
  }

  protected implicitQuadSource(context: IActionContext): { match: (pattern: Algebra.Pattern) => AsyncIterator<RDF.Quad> } {
    return this.explicitQuadSource(setImplicitSource(context));
  }

  protected unionQuadSource(context: IActionContext): { match: (pattern: Algebra.Pattern) => AsyncIterator<RDF.Quad> } {
    return this.explicitQuadSource(setUnionSource(context));
  }

  public getRules(action: IActionRdfReason): AsyncIterator<Rule> {
    const getRules = async() => {
      const { data } = await this.mediatorRuleResolve.mediate(action);
      const { rules } = await this.mediatorOptimizeRule.mediate({ rules: data, ...action });
      return rules;
    };
    return wrap<Rule>(getRules());
  }

  public async run(action: IActionRdfReason): Promise<IActorRdfReasonOutput> {
    return {
      execute: async() => {
        await this.execute({ ...action, rules: await this.getRules(action).toArray() });
      },
    };
  }

  public abstract execute(action: IActionRdfReasonExecute): Promise<void>;
}

export interface IActionRdfReasonExecute extends IActionRdfReason {
  rules: Rule[];
}

export interface IActorRdfReasonMediatedArgs
  extends IActorArgs<IActionRdfReason, IActorTest, IActorRdfReasonOutput> {
  mediatorRdfUpdateQuads: MediatorRdfUpdateQuads;
  mediatorRdfResolveQuadPattern: MediatorRdfResolveQuadPattern;
  mediatorRuleResolve: MediatorRuleResolve;
  mediatorOptimizeRule: MediatorOptimizeRule;
}
