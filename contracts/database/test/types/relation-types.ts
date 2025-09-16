import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'tableA';
      relations: {
        // Primary to unique
        'id@primary_to_unique': 'tableU:unique_u';
      };
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        value: number;
      };
    },
    {
      name: 'tableB';
      relations: {
        // Primary to secondary
        'id@primary_to_secondary': 'tableS:secondary_s';
      };
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        value: number;
      };
    },
    {
      name: 'tableC';
      relations: {
        // Unique to primary
        'unique@unique_to_primary': 'tableP:id_p';
      };
      indexes: {
        id: Index.Primary;
        unique: Index.Unique;
      };
      schema: {
        id: string;
        unique: string;
        value: number;
      };
    },
    {
      name: 'tableD';
      relations: {
        // Unique to unique
        'unique@unique_to_unique': 'tableU:unique_u';
      };
      indexes: {
        id: Index.Primary;
        unique: Index.Unique;
      };
      schema: {
        id: string;
        unique: string;
        value: number;
      };
    },
    {
      name: 'tableE';
      relations: {
        // Unique to secondary
        'unique@unique_to_secondary': 'tableS:secondary_s';
      };
      indexes: {
        id: Index.Primary;
        unique: Index.Unique;
      };
      schema: {
        id: string;
        unique: string;
        value: number;
      };
    },
    {
      name: 'tableF';
      relations: {
        // Secondary to primary
        'secondary@secondary_to_primary': 'tableP:id_p';
      };
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        secondary: string;
        value: number;
      };
    },
    {
      name: 'tableG';
      relations: {
        // Secondary to unique
        'secondary@secondary_to_unique': 'tableU:unique_u';
      };
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        secondary: string;
        value: number;
      };
    },
    {
      name: 'tableP';
      indexes: {
        id_p: Index.Primary;
      };
      schema: {
        id_p: string;
        value_p: number;
      };
    },
    {
      name: 'tableS';
      indexes: {
        id_s: Index.Primary;
      };
      schema: {
        id_s: string;
        secondary_s: string;
        value_s: number;
      };
    },
    {
      name: 'tableU';
      indexes: {
        id_u: Index.Primary;
        unique_u: Index.Unique;
      };
      schema: {
        id_u: string;
        unique_u: string;
        value_u: number;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testPrimaryToUnique = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableA, tableU and connect them using the relation in the unique column.
  // Column `unique_u` will correspond to the tableA `id` column.
  await selfClient.tableA.insertOne({
    data: {
      id: 'foo',
      value: 123,
      primary_to_unique: {
        id_u: 'bar',
        value_u: 456
        // unique_u
      }
    }
  });

  // Create tableA and connect tableU using the relation in the unique column.
  // Column `unique_u` will be assigned with the tableA `id` column.
  await selfClient.tableA.insertOne({
    data: {
      id: 'foo',
      value: 123,
      primary_to_unique: {
        unique_u: 'bar'
      }
    }
  });
};

export const testPrimaryToSecondary = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableB, tableS and connect them using the relation in the secondary column.
  // Column `secondary_s` will correspond to the tableB `id` column.
  await selfClient.tableB.insertOne({
    data: {
      id: 'foo',
      value: 123,
      primary_to_secondary: [
        {
          id_s: 'bar',
          value_s: 456
          // secondary_s
        }
      ]
    }
  });

  // Create tableB and connect tableS using the relation in the secondary column.
  // Column `secondary_s` will be assigned with the tableB `id` column.
  await selfClient.tableB.insertOne({
    data: {
      id: 'foo',
      value: 123,
      primary_to_secondary: [
        {
          id_s: 'bar'
        }
      ]
    }
  });
};

export const testUniqueToPrimary = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableC, tableP and connect them using the relation in the unique column.
  // Column `unique` will correspond to the tableP `id_p` column.
  await selfClient.tableC.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // unique
      unique_to_primary: {
        id_p: 'bar',
        value_p: 456
      }
    }
  });

  // Create tableC and connect tableP using the relation in the unique column.
  // Column `unique` will be assigned with the tableP `id_p` column.
  await selfClient.tableC.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // unique
      unique_to_primary: {
        id_p: 'bar'
      }
    }
  });
};

export const testUniqueToUnique = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableD, tableU and connect them using the relation in the unique column.
  // Column `unique` will correspond to the tableD `unique_u` column.
  await selfClient.tableD.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // unique
      unique_to_unique: {
        id_u: 'bar',
        unique_u: 'baz',
        value_u: 123
      }
    }
  });

  // Create tableD and connect tableZ using the relation in the unique column.
  // Column `unique` will be assigned with the tableD `unique_u` column.
  await selfClient.tableD.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // unique
      unique_to_unique: {
        unique_u: 'baz'
      }
    }
  });
};

export const testUniqueToSecondary = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableE, tableZ and connect them using the relation in the secondary column.
  // Column `secondary_s` will correspond to the tableE `unique` column.
  await selfClient.tableE.insertOne({
    data: {
      id: 'foo',
      value: 123,
      unique: 'bar',
      unique_to_secondary: [
        {
          id_s: 'baz',
          value_s: 123
          // secondary_s
        }
      ]
    }
  });

  // Create tableE and connect tableZ using the relation in the unique column.
  // Column `secondary_s` will be assigned with the tableE `unique` column.
  await selfClient.tableE.insertOne({
    data: {
      id: 'foo',
      value: 123,
      unique: 'bar',
      unique_to_secondary: [
        {
          id_s: 'baz'
        }
      ]
    }
  });
};

export const testSecondaryToPrimary = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableF, tableZ and connect them using the relation in the secondary column.
  // Column `secondary` will correspond to the tableF `id_p` column.
  await selfClient.tableF.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // secondary
      secondary_to_primary: {
        id_p: 'bar',
        value_p: 123
      }
    }
  });

  // Create tableF and connect tableZ using the relation in the secondary column.
  // Column `secondary` will be assigned with the tableF `id_p` column.
  await selfClient.tableF.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // secondary
      secondary_to_primary: {
        id_p: 'bar'
      }
    }
  });
};

export const testSecondaryToUnique = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableG, tableZ and connect them using the relation in the secondary column.
  // Column `secondary` will correspond to the tableG `unique_u` column.
  await selfClient.tableG.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // secondary
      secondary_to_unique: {
        id_u: 'bar',
        unique_u: 'baz',
        value_u: 123
      }
    }
  });

  // Create tableG and connect tableZ using the relation in the secondary column.
  // Column `secondary` will be assigned with the tableG `unique_u` column.
  await selfClient.tableG.insertOne({
    data: {
      id: 'foo',
      value: 123,
      // secondary
      secondary_to_unique: {
        unique_u: 'bar'
      }
    }
  });
};
