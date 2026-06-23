import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

/**
 * Regression test for type-instantiation depth: resolving the client type for a
 * service with many tables must stay within TypeScript's instantiation-depth
 * limit. Before the tail-recursive `Merge*` helpers, ~45 tables were enough to
 * raise a `TS2589` error here, which also broke relation-connect inputs.
 */
export declare class ManyTablesDatabase extends Database.Service<TestEngine> {
  client: Client<ManyTablesDatabase>;

  tables: [
    Database.UseTable<{
      name: 'table0';
      relations: {
        'ref0@parent0': 'table1:id';
      };
      indexes: {
        id: Index.Primary;
        ref0: Index.Secondary;
      };
      schema: {
        id: string;
        ref0: string;
        value0: number;
      };
    }>,
    Database.UseTable<{
      name: 'table1';
      relations: {
        'ref1@parent1': 'table2:id';
      };
      indexes: {
        id: Index.Primary;
        ref1: Index.Secondary;
      };
      schema: {
        id: string;
        ref1: string;
        value1: number;
      };
    }>,
    Database.UseTable<{
      name: 'table2';
      relations: {
        'ref2@parent2': 'table3:id';
      };
      indexes: {
        id: Index.Primary;
        ref2: Index.Secondary;
      };
      schema: {
        id: string;
        ref2: string;
        value2: number;
      };
    }>,
    Database.UseTable<{
      name: 'table3';
      relations: {
        'ref3@parent3': 'table4:id';
      };
      indexes: {
        id: Index.Primary;
        ref3: Index.Secondary;
      };
      schema: {
        id: string;
        ref3: string;
        value3: number;
      };
    }>,
    Database.UseTable<{
      name: 'table4';
      relations: {
        'ref4@parent4': 'table5:id';
      };
      indexes: {
        id: Index.Primary;
        ref4: Index.Secondary;
      };
      schema: {
        id: string;
        ref4: string;
        value4: number;
      };
    }>,
    Database.UseTable<{
      name: 'table5';
      relations: {
        'ref5@parent5': 'table6:id';
      };
      indexes: {
        id: Index.Primary;
        ref5: Index.Secondary;
      };
      schema: {
        id: string;
        ref5: string;
        value5: number;
      };
    }>,
    Database.UseTable<{
      name: 'table6';
      relations: {
        'ref6@parent6': 'table7:id';
      };
      indexes: {
        id: Index.Primary;
        ref6: Index.Secondary;
      };
      schema: {
        id: string;
        ref6: string;
        value6: number;
      };
    }>,
    Database.UseTable<{
      name: 'table7';
      relations: {
        'ref7@parent7': 'table8:id';
      };
      indexes: {
        id: Index.Primary;
        ref7: Index.Secondary;
      };
      schema: {
        id: string;
        ref7: string;
        value7: number;
      };
    }>,
    Database.UseTable<{
      name: 'table8';
      relations: {
        'ref8@parent8': 'table9:id';
      };
      indexes: {
        id: Index.Primary;
        ref8: Index.Secondary;
      };
      schema: {
        id: string;
        ref8: string;
        value8: number;
      };
    }>,
    Database.UseTable<{
      name: 'table9';
      relations: {
        'ref9@parent9': 'table10:id';
      };
      indexes: {
        id: Index.Primary;
        ref9: Index.Secondary;
      };
      schema: {
        id: string;
        ref9: string;
        value9: number;
      };
    }>,
    Database.UseTable<{
      name: 'table10';
      relations: {
        'ref10@parent10': 'table11:id';
      };
      indexes: {
        id: Index.Primary;
        ref10: Index.Secondary;
      };
      schema: {
        id: string;
        ref10: string;
        value10: number;
      };
    }>,
    Database.UseTable<{
      name: 'table11';
      relations: {
        'ref11@parent11': 'table12:id';
      };
      indexes: {
        id: Index.Primary;
        ref11: Index.Secondary;
      };
      schema: {
        id: string;
        ref11: string;
        value11: number;
      };
    }>,
    Database.UseTable<{
      name: 'table12';
      relations: {
        'ref12@parent12': 'table13:id';
      };
      indexes: {
        id: Index.Primary;
        ref12: Index.Secondary;
      };
      schema: {
        id: string;
        ref12: string;
        value12: number;
      };
    }>,
    Database.UseTable<{
      name: 'table13';
      relations: {
        'ref13@parent13': 'table14:id';
      };
      indexes: {
        id: Index.Primary;
        ref13: Index.Secondary;
      };
      schema: {
        id: string;
        ref13: string;
        value13: number;
      };
    }>,
    Database.UseTable<{
      name: 'table14';
      relations: {
        'ref14@parent14': 'table15:id';
      };
      indexes: {
        id: Index.Primary;
        ref14: Index.Secondary;
      };
      schema: {
        id: string;
        ref14: string;
        value14: number;
      };
    }>,
    Database.UseTable<{
      name: 'table15';
      relations: {
        'ref15@parent15': 'table16:id';
      };
      indexes: {
        id: Index.Primary;
        ref15: Index.Secondary;
      };
      schema: {
        id: string;
        ref15: string;
        value15: number;
      };
    }>,
    Database.UseTable<{
      name: 'table16';
      relations: {
        'ref16@parent16': 'table17:id';
      };
      indexes: {
        id: Index.Primary;
        ref16: Index.Secondary;
      };
      schema: {
        id: string;
        ref16: string;
        value16: number;
      };
    }>,
    Database.UseTable<{
      name: 'table17';
      relations: {
        'ref17@parent17': 'table18:id';
      };
      indexes: {
        id: Index.Primary;
        ref17: Index.Secondary;
      };
      schema: {
        id: string;
        ref17: string;
        value17: number;
      };
    }>,
    Database.UseTable<{
      name: 'table18';
      relations: {
        'ref18@parent18': 'table19:id';
      };
      indexes: {
        id: Index.Primary;
        ref18: Index.Secondary;
      };
      schema: {
        id: string;
        ref18: string;
        value18: number;
      };
    }>,
    Database.UseTable<{
      name: 'table19';
      relations: {
        'ref19@parent19': 'table20:id';
      };
      indexes: {
        id: Index.Primary;
        ref19: Index.Secondary;
      };
      schema: {
        id: string;
        ref19: string;
        value19: number;
      };
    }>,
    Database.UseTable<{
      name: 'table20';
      relations: {
        'ref20@parent20': 'table21:id';
      };
      indexes: {
        id: Index.Primary;
        ref20: Index.Secondary;
      };
      schema: {
        id: string;
        ref20: string;
        value20: number;
      };
    }>,
    Database.UseTable<{
      name: 'table21';
      relations: {
        'ref21@parent21': 'table22:id';
      };
      indexes: {
        id: Index.Primary;
        ref21: Index.Secondary;
      };
      schema: {
        id: string;
        ref21: string;
        value21: number;
      };
    }>,
    Database.UseTable<{
      name: 'table22';
      relations: {
        'ref22@parent22': 'table23:id';
      };
      indexes: {
        id: Index.Primary;
        ref22: Index.Secondary;
      };
      schema: {
        id: string;
        ref22: string;
        value22: number;
      };
    }>,
    Database.UseTable<{
      name: 'table23';
      relations: {
        'ref23@parent23': 'table24:id';
      };
      indexes: {
        id: Index.Primary;
        ref23: Index.Secondary;
      };
      schema: {
        id: string;
        ref23: string;
        value23: number;
      };
    }>,
    Database.UseTable<{
      name: 'table24';
      relations: {
        'ref24@parent24': 'table25:id';
      };
      indexes: {
        id: Index.Primary;
        ref24: Index.Secondary;
      };
      schema: {
        id: string;
        ref24: string;
        value24: number;
      };
    }>,
    Database.UseTable<{
      name: 'table25';
      relations: {
        'ref25@parent25': 'table26:id';
      };
      indexes: {
        id: Index.Primary;
        ref25: Index.Secondary;
      };
      schema: {
        id: string;
        ref25: string;
        value25: number;
      };
    }>,
    Database.UseTable<{
      name: 'table26';
      relations: {
        'ref26@parent26': 'table27:id';
      };
      indexes: {
        id: Index.Primary;
        ref26: Index.Secondary;
      };
      schema: {
        id: string;
        ref26: string;
        value26: number;
      };
    }>,
    Database.UseTable<{
      name: 'table27';
      relations: {
        'ref27@parent27': 'table28:id';
      };
      indexes: {
        id: Index.Primary;
        ref27: Index.Secondary;
      };
      schema: {
        id: string;
        ref27: string;
        value27: number;
      };
    }>,
    Database.UseTable<{
      name: 'table28';
      relations: {
        'ref28@parent28': 'table29:id';
      };
      indexes: {
        id: Index.Primary;
        ref28: Index.Secondary;
      };
      schema: {
        id: string;
        ref28: string;
        value28: number;
      };
    }>,
    Database.UseTable<{
      name: 'table29';
      relations: {
        'ref29@parent29': 'table30:id';
      };
      indexes: {
        id: Index.Primary;
        ref29: Index.Secondary;
      };
      schema: {
        id: string;
        ref29: string;
        value29: number;
      };
    }>,
    Database.UseTable<{
      name: 'table30';
      relations: {
        'ref30@parent30': 'table31:id';
      };
      indexes: {
        id: Index.Primary;
        ref30: Index.Secondary;
      };
      schema: {
        id: string;
        ref30: string;
        value30: number;
      };
    }>,
    Database.UseTable<{
      name: 'table31';
      relations: {
        'ref31@parent31': 'table32:id';
      };
      indexes: {
        id: Index.Primary;
        ref31: Index.Secondary;
      };
      schema: {
        id: string;
        ref31: string;
        value31: number;
      };
    }>,
    Database.UseTable<{
      name: 'table32';
      relations: {
        'ref32@parent32': 'table33:id';
      };
      indexes: {
        id: Index.Primary;
        ref32: Index.Secondary;
      };
      schema: {
        id: string;
        ref32: string;
        value32: number;
      };
    }>,
    Database.UseTable<{
      name: 'table33';
      relations: {
        'ref33@parent33': 'table34:id';
      };
      indexes: {
        id: Index.Primary;
        ref33: Index.Secondary;
      };
      schema: {
        id: string;
        ref33: string;
        value33: number;
      };
    }>,
    Database.UseTable<{
      name: 'table34';
      relations: {
        'ref34@parent34': 'table35:id';
      };
      indexes: {
        id: Index.Primary;
        ref34: Index.Secondary;
      };
      schema: {
        id: string;
        ref34: string;
        value34: number;
      };
    }>,
    Database.UseTable<{
      name: 'table35';
      relations: {
        'ref35@parent35': 'table36:id';
      };
      indexes: {
        id: Index.Primary;
        ref35: Index.Secondary;
      };
      schema: {
        id: string;
        ref35: string;
        value35: number;
      };
    }>,
    Database.UseTable<{
      name: 'table36';
      relations: {
        'ref36@parent36': 'table37:id';
      };
      indexes: {
        id: Index.Primary;
        ref36: Index.Secondary;
      };
      schema: {
        id: string;
        ref36: string;
        value36: number;
      };
    }>,
    Database.UseTable<{
      name: 'table37';
      relations: {
        'ref37@parent37': 'table38:id';
      };
      indexes: {
        id: Index.Primary;
        ref37: Index.Secondary;
      };
      schema: {
        id: string;
        ref37: string;
        value37: number;
      };
    }>,
    Database.UseTable<{
      name: 'table38';
      relations: {
        'ref38@parent38': 'table39:id';
      };
      indexes: {
        id: Index.Primary;
        ref38: Index.Secondary;
      };
      schema: {
        id: string;
        ref38: string;
        value38: number;
      };
    }>,
    Database.UseTable<{
      name: 'table39';
      relations: {
        'ref39@parent39': 'table40:id';
      };
      indexes: {
        id: Index.Primary;
        ref39: Index.Secondary;
      };
      schema: {
        id: string;
        ref39: string;
        value39: number;
      };
    }>,
    Database.UseTable<{
      name: 'table40';
      relations: {
        'ref40@parent40': 'table41:id';
      };
      indexes: {
        id: Index.Primary;
        ref40: Index.Secondary;
      };
      schema: {
        id: string;
        ref40: string;
        value40: number;
      };
    }>,
    Database.UseTable<{
      name: 'table41';
      relations: {
        'ref41@parent41': 'table42:id';
      };
      indexes: {
        id: Index.Primary;
        ref41: Index.Secondary;
      };
      schema: {
        id: string;
        ref41: string;
        value41: number;
      };
    }>,
    Database.UseTable<{
      name: 'table42';
      relations: {
        'ref42@parent42': 'table43:id';
      };
      indexes: {
        id: Index.Primary;
        ref42: Index.Secondary;
      };
      schema: {
        id: string;
        ref42: string;
        value42: number;
      };
    }>,
    Database.UseTable<{
      name: 'table43';
      relations: {
        'ref43@parent43': 'table44:id';
      };
      indexes: {
        id: Index.Primary;
        ref43: Index.Secondary;
      };
      schema: {
        id: string;
        ref43: string;
        value43: number;
      };
    }>,
    Database.UseTable<{
      name: 'table44';
      relations: {
        'ref44@parent44': 'table45:id';
      };
      indexes: {
        id: Index.Primary;
        ref44: Index.Secondary;
      };
      schema: {
        id: string;
        ref44: string;
        value44: number;
      };
    }>,
    Database.UseTable<{
      name: 'table45';
      relations: {
        'ref45@parent45': 'table46:id';
      };
      indexes: {
        id: Index.Primary;
        ref45: Index.Secondary;
      };
      schema: {
        id: string;
        ref45: string;
        value45: number;
      };
    }>,
    Database.UseTable<{
      name: 'table46';
      relations: {
        'ref46@parent46': 'table47:id';
      };
      indexes: {
        id: Index.Primary;
        ref46: Index.Secondary;
      };
      schema: {
        id: string;
        ref46: string;
        value46: number;
      };
    }>,
    Database.UseTable<{
      name: 'table47';
      relations: {
        'ref47@parent47': 'table48:id';
      };
      indexes: {
        id: Index.Primary;
        ref47: Index.Secondary;
      };
      schema: {
        id: string;
        ref47: string;
        value47: number;
      };
    }>,
    Database.UseTable<{
      name: 'table48';
      relations: {
        'ref48@parent48': 'table49:id';
      };
      indexes: {
        id: Index.Primary;
        ref48: Index.Secondary;
      };
      schema: {
        id: string;
        ref48: string;
        value48: number;
      };
    }>,
    Database.UseTable<{
      name: 'table49';
      relations: {
        'ref49@parent49': 'table0:id';
      };
      indexes: {
        id: Index.Primary;
        ref49: Index.Secondary;
      };
      schema: {
        id: string;
        ref49: string;
        value49: number;
      };
    }>
  ];

  services: {
    selfClient: Environment.Service<ManyTablesDatabase>;
  };
}

export const testManyTables = async ({ selfClient }: Service.Context<ManyTablesDatabase>) => {
  // Forces full client instantiation, including relation-connect inputs.
  await selfClient.table0.insertOne({
    data: {
      id: 'foo',
      value0: 1,
      parent0: {
        id: 'bar'
      }
    }
  });

  const result = await selfClient.table0.findMany({
    select: {
      value0: true,
      parent0: {
        value1: true
      }
    },
    where: {
      value0: 1
    }
  });

  result.records[0].parent0?.value1;
};
