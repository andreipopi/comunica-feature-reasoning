import { Bus } from '@comunica/core';
import { ActorRdfReasonForwardChaining } from '../lib/ActorRdfReasonForwardChaining';

describe('ActorRdfReasonForwardChaining', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfReasonForwardChaining instance', () => {
    let actor: ActorRdfReasonForwardChaining;

    beforeEach(() => {
      actor = new ActorRdfReasonForwardChaining({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});