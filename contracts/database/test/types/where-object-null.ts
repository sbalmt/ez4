import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service<TestEngine> {
  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
      name: 'table';
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        json_object: null | {
          value: string;
          nested: null | {
            value: string;
          };
        };
      };
    }>
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testHandler = ({ selfClient }: Service.Context<TestDatabase>) => {
  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        isMissing: true
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        isMissing: false
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        nested: {
          isMissing: true
        }
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        nested: {
          isMissing: false
        }
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        isMissingOrNull: true
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        isMissingOrNull: false
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        nested: {
          isMissingOrNull: true
        }
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        isNull: true
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        isNull: false
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: {
        value: 'foo',
        nested: {
          isNull: true
        }
      }
    }
  });

  selfClient.table.findMany({
    select: {},
    where: {
      json_object: null
    }
  });
};
