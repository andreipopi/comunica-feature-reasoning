import { Bus } from '@comunica/core';
import { ActorRdfResolveQuadPatternInterceptReasoned } from '../lib/ActorRdfResolveQuadPatternInterceptReasoned';

describe('ActorRdfResolveQuadPatternInterceptReasoned', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfResolveQuadPatternInterceptReasoned instance', () => {
    let actor: ActorRdfResolveQuadPatternInterceptReasoned;

    beforeEach(() => {
      actor = new ActorRdfResolveQuadPatternInterceptReasoned({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});