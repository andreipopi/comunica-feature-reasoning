import { ActorRdfReason, IActionRdfReason, IActorRdfReasonOutput, IActorRdfReasonArgs, setImplicitDestination } from '@comunica/bus-rdf-reason';
import { IActorArgs, IActorTest } from '@comunica/core';
import type { MediatorOptimizeRule } from '@comunica/bus-optimize-rule';
import type { MediatorRdfResolveQuadPattern } from '@comunica/bus-rdf-resolve-quad-pattern';
import type {
  IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput, MediatorRdfUpdateQuads,
} from '@comunica/bus-rdf-update-quads';
import type { MediatorRuleResolve } from '@comunica/bus-rule-resolve';
import { RdfParser } from 'rdf-parse';
import { Pattern } from 'sparqlalgebrajs/lib/algebra';
import { Algebra } from 'sparqlalgebrajs';
import { Factory } from 'sparqlalgebrajs';
import { DataFactory, DefaultGraph, Literal, NamedNode, Quad, Variable } from 'n3';
import { AsyncIterator } from 'asynciterator';
import type * as RDF from '@rdfjs/types';

import { fromArray } from 'asynciterator'
import { ActorRuleParseN3 } from '../../actor-rule-parse-n3/lib';
/**
 * A comunica Materialise RDF Reason Actor.
 */
export class ActorRdfReasonMaterialise extends ActorRdfReason {

  public readonly mediatorRdfUpdateQuads: MediatorRdfUpdateQuads;

  public readonly mediatorRdfResolveQuadPattern: MediatorRdfResolveQuadPattern;

  public readonly mediatorRuleResolve: MediatorRuleResolve;

  public readonly mediatorOptimizeRule: MediatorOptimizeRule;

  public constructor(args: IActorRdfReasonMaterialiseArgs) {
    super(args);
  }

  public async test(action: IActionRdfReason): Promise<IActorTest> {
    return true; // TODO implement
  }


  protected async runExplicitUpdate(changes: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    return this.mediatorRdfUpdateQuads.mediate(changes);
  }

  protected async runImplicitUpdate(action: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    return this.runExplicitUpdate({ ...action, context: setImplicitDestination(action.context) });
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
    
    /*const { rules } = action;
    for(let rule in rules){
      console.log(rule);
    }*/


    // the rule stream (dont be mislead by the data name - try "Go to Definition")
    const { data } = await this.mediatorRuleResolve.mediate(action);
    for(let rule in data){
      console.log(rule);
    }

    let reasoningStatus = {
      execute: async(): Promise<void> => { //what is the synthatic sugar of this line?
      //const { status } = getSafeData(action.context);
      //return status.done; //why in mediated it is available but not to here?
      //const factory = new Factory();
      //const pattern = factory.createPattern(new Variable('s'), new Variable('p'), new Variable('o'));
        const { context, pattern } = action;
       /* if(pattern){
          this.mediatorRdfResolveQuadPattern.mediate({context, pattern}).then(
            ({data}) => {
             // let quadStreamInsert: AsyncIterator<RDF.Quad> {
             // }
             //quadStreamInsert.push(new Quad(new NamedNode('<https://www.rubensworks.net/#me>'), new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), new Literal('postdoc')));  
             //let quadStreamInsert: RDF.Quad[] =[];
             //quadStreamInsert.push(new Quad(new NamedNode('<https://www.rubensworks.net/#me>'), new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), new Literal('postdoc')));
             // this.runImplicitUpdate({quadStreamInsert, context});
             //this.mediatorRdfUpdateQuads.mediate({quadStreamInsert, context})
             //this.runImplicitUpdate({ quadStreamInsert: data.clone(), context });
              this.mediatorRdfUpdateQuads.mediate() 
            }  
          )
        } */
       
        
        

        const quadStreamInsert = fromArray([
          new Quad(new NamedNode('https://www.rubensworks.net/#me'), new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), new NamedNode('postdoc') )
        ]);
       
        const result = await this.runImplicitUpdate({ quadStreamInsert, context });
       
        // 
        await result.execute();


        if(pattern){
          this.mediatorRdfResolveQuadPattern.mediate({context, pattern}).then(
            ({data}) => {
              let contatore = 0;
              data.forEach(element => {
                 contatore+=1;
                 console.log(contatore+": "+element.subject.value+" "+element.predicate.value+" "+element.object.value);
              });
            }
          )
        }
    

        /*
        const pattern = {
          type: 'bgp',
          patterns: [{
            subject: { variable: { termType: 'Variable', value: 's' }},
            predicate: { variable: { termType: 'Variable', value:  '?p' }},
            object: { variable: { termType: 'Variable', value:  '?o' }},
            graph: { value: '' },
            type: 'pattern',
          }],
        };
        const pattern = new Pattern."SELECT * WHERE { ?s ?p ?o }";
        */
      }
    };

    console.log("reasoningStatus", reasoningStatus);
    return reasoningStatus;
  } 
}


export interface IActorRdfReasonMaterialiseArgs extends IActorRdfReasonArgs {
  mediatorRdfUpdateQuads: MediatorRdfUpdateQuads;

  mediatorRdfResolveQuadPattern: MediatorRdfResolveQuadPattern;

  mediatorRuleResolve: MediatorRuleResolve;

  mediatorOptimizeRule: MediatorOptimizeRule;

}
