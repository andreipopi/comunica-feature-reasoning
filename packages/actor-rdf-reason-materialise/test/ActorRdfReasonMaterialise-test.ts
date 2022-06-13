import { Bus } from '@comunica/core';
import { ActorRdfReasonMaterialise } from '../lib/ActorRdfReasonMaterialise';

describe('ActorRdfReasonMaterialise', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfReasonMaterialise instance', () => {
    let actor: ActorRdfReasonMaterialise;

    beforeEach(() => {
      actor = new ActorRdfReasonMaterialise({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
