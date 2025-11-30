import type { Database, Index } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    Database.UseTable<{
      name: 'tableA';
      schema: {
        id_a: string;
        relation_1_id?: string | null;
        relation_2_id?: string | null;
        value: string;
      };
      relations: {
        // Secondary to primary
        'relation_1_id@relation_1': 'tableB:id_b';

        // Secondary to unique
        'relation_2_id@relation_2': 'tableC:unique_2_id';
      };
      indexes: {
        id_a: Index.Primary;
        relation_1_id: Index.Secondary;
        relation_2_id: Index.Secondary;
      };
    }>,
    Database.UseTable<{
      name: 'tableB';
      schema: {
        id_b: string;
        value: string;
      };
      relations: {
        // Primary to secondary
        'id_b@relations': 'tableA:relation_1_id';

        // Primary to unique
        'id_b@relation': 'tableC:unique_1_id';
      };
      indexes: {
        id_b: Index.Primary;
      };
    }>,
    Database.UseTable<{
      name: 'tableC';
      schema: {
        id_c: string;
        unique_1_id?: string | null;
        unique_2_id?: string | null;
        value: string;
      };
      relations: {
        // Unique to primary
        'unique_1_id@relation': 'tableB:id_b';

        // Unique to secondary
        'unique_2_id@relations': 'tableA:relation_2_id';
      };
      indexes: {
        id_c: Index.Primary;
        unique_1_id: Index.Unique;
        unique_2_id: Index.Unique;
      };
    }>
  ];
}
