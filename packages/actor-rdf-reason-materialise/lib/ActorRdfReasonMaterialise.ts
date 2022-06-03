import { ActorRdfReason, IActionRdfReason, setUnionSource, IActorRdfReasonOutput, IActorRdfReasonArgs, getSafeData, setImplicitDestination } from '@comunica/bus-rdf-reason';
import { IActorArgs, IActorTest } from '@comunica/core';
import { match } from 'assert';
import { executionAsyncResource } from 'async_hooks';
import { mediatorRdfResolveQuadPattern } from '../../reasoning-mocks/lib';
import type { MediatorOptimizeRule } from '@comunica/bus-optimize-rule';
import type { MediatorRdfResolveQuadPattern } from '@comunica/bus-rdf-resolve-quad-pattern';
import type {MediatorRdfUpdateQuads} from '@comunica/bus-rdf-update-quads';
import type { MediatorRuleResolve } from '@comunica/bus-rule-resolve';
import type {
  IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput,
} from '@comunica/bus-rdf-update-quads';
import { IActionContext } from '@comunica/types';

import type { Algebra } from 'sparqlalgebrajs';
import { evaluateRuleSet } from '../../actor-rdf-reason-rule-restriction/lib';
import type * as RDF from '@rdfjs/types';
import { Rule } from '@comunica/reasoning-types';
import {wrap, AsyncIterator } from 'asynciterator';



/**
 * A comunica Materialise RDF Reason Actor.
 */
export class ActorRdfReasonMaterialise extends ActorRdfReason {

  public readonly mediatorRdfUpdateQuads: MediatorRdfUpdateQuads;

  public readonly mediatorRdfResolveQuadPattern: MediatorRdfResolveQuadPattern;

  public readonly mediatorRuleResolve: MediatorRuleResolve;

  public readonly mediatorOptimizeRule: MediatorOptimizeRule;


  protected explicitQuadSource(context: IActionContext): {
    match: (pattern: Algebra.Pattern) => AsyncIterator<RDF.Quad>;
  } {
    return {
      match: (pattern: Algebra.Pattern): AsyncIterator<RDF.Quad> => wrap(
        this.mediatorRdfResolveQuadPattern.mediate({ context, pattern }).then(({ data }) => data),
      ),
    };
  }

  protected unionQuadSource(context: IActionContext): { match: (pattern: Algebra.Pattern) => AsyncIterator<RDF.Quad> } {
    return this.explicitQuadSource(setUnionSource(context));
  }

  public constructor(args: IActorRdfReasonMaterialiseArgs) {
    super(args);
  }
  public async test(action: IActionRdfReason): Promise<IActorTest> {
    return true;
  }

  public async run(action: IActionRdfReason): Promise<IActorRdfReasonOutput> {
    // where is the data fetched from the contxt
    // get data from context
    // add new data to it
    // are there different contexts used reasoning 
    //console.log("quads in store", store.getQuads("?s", "?p","?o", ''));
    //console.log("the store is ", store); 
    //return {  execute: async(): Promise<void> => {
    //  console.log(action.context);
      // can I just do my materialisation here?
    //}
    //};

    this.unionQuadSource(action.context).match;
    
    let reasoningStatus = {
      execute: async(): Promise<void> => { //what is the synthatic sugar of this line?
        //const { status } = getSafeData(action.context);
        //return status.done; //why in mediated it is available but not to here?
        console.log("ciao");

        const { context, pattern } = action;

        if(pattern){
          this.mediatorRdfResolveQuadPattern.mediate({ context, pattern  } ).then(
            ({ data }) => data)
        }
        //here I can do the materialisation?
      }
    };
    return reasoningStatus;
  }
}

export interface IActorRdfReasonMaterialiseArgs extends IActorRdfReasonArgs {
  mediatorRdfUpdateQuads: MediatorRdfUpdateQuads;

  mediatorRdfResolveQuadPattern: MediatorRdfResolveQuadPattern;

  mediatorRuleResolve: MediatorRuleResolve;

  mediatorOptimizeRule: MediatorOptimizeRule;

}

export interface IActionRdfReasonExecute extends IActionRdfReason {
  rules: Rule[];
}