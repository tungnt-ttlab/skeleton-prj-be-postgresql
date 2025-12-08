import { Inject } from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LANGUAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    OrderBy,
    OrderDirection,
} from '../constants';
import {
    Brackets,
    DataSource,
    EntityManager,
    FindOptionsWhere,
    Repository,
    SelectQueryBuilder,
    DeepPartial,
    In,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from '@/database/postgres/entities';
import { createWinstonLogger } from '../services/winston.service';
import { generateUuid, withRetry } from '../helpers/commonFunctions';
import { CommonListQuery } from '../interfaces';

export class BaseRepository<T extends BaseEntity> extends Repository<T> {
    readonly _entityManager: EntityManager;

    logger: LoggerWinston;

    constructor(
        private readonly _dataSource: DataSource,
        private readonly entity: new () => T,
    ) {
        super(entity, _dataSource.createEntityManager());
        this._entityManager = _dataSource.createEntityManager();
        this.logger = createWinstonLogger(this.constructor.name);
    }

    @Inject()
    i18n!: I18nService;

    async findOneByQuery(
        query: FindOptionsWhere<T>,
        attributes?: (keyof T)[],
        entityManager?: EntityManager,
    ): Promise<T | undefined> {
        try {
            const manager = entityManager || this._entityManager;
            const data = await manager.findOne(this.entity, {
                where: query,
                select: attributes as any,
            });

            return data;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' findOneByQuery: ${error}`,
            );
            throw error;
        }
    }

    async findOneByQueryForUpdate(
        query: FindOptionsWhere<T>,
        entityManager: EntityManager,
    ): Promise<T | undefined> {
        try {
            const queryBuilder = entityManager.createQueryBuilder(
                this.entity,
                'entity',
            );
            queryBuilder.where(query);
            queryBuilder.setLock('pessimistic_write');
            const result = await queryBuilder.getOne();
            return result;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' findOneByQueryForUpdate: ${error}`,
            );
            throw error;
        }
    }

    async findOneById(
        id: number,
        attributes?: (keyof T)[],
        entityManager?: EntityManager,
    ): Promise<T | undefined> {
        try {
            const where: FindOptionsWhere<T> = { id: id as any };
            const manager = entityManager || this._entityManager;
            const data = await manager.findOne(this.entity, {
                where,
                select: attributes as any,
            });
            return data;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' findOneById: ${error}`,
            );
            throw error;
        }
    }

    async updateOneById(
        id: number,
        payload: QueryDeepPartialEntity<T>,
        entityManager?: EntityManager,
    ): Promise<T> {
        try {
            const manager = entityManager || this._entityManager;
            await manager
                .createQueryBuilder()
                .update(this.entity)
                .set(payload)
                .where('id = :id', { id })
                .returning('*')
                .execute()
                .then((response) => response.raw);
            const updatedRecord = await this.findOneWithDeleted(
                { id: id as any },
                undefined,
                entityManager,
            );

            return updatedRecord || ({ id } as T);
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' updateOneById: ${error}`,
            );
            throw error;
        }
    }

    async updateManyByQuery(
        query: FindOptionsWhere<T>,
        payload: QueryDeepPartialEntity<T>,
        entityManager?: EntityManager,
    ): Promise<T[]> {
        try {
            const manager = entityManager || this._entityManager;
            const updatedRecords = await manager
                .createQueryBuilder()
                .update(this.entity)
                .set(payload)
                .where(query)
                .returning('*')
                .execute()
                .then((response) => response.raw);

            const updatedRecordIds: number[] = updatedRecords.map(
                (record) => record.id,
            );
            if (!updatedRecordIds?.length) {
                return [];
            }
            const result = await this.findManyByQueryWithDeleted({
                query: {
                    id: In(updatedRecordIds) as any,
                },
                entityManager,
            });
            return result;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' updateManyByQuery: ${error}`,
            );
            throw error;
        }
    }

    translate(key: I18nKey, options?: TranslateOptions): string {
        // In testing environment, I18nContext is not available
        return this.i18n.translate(key as string, {
            lang: I18nContext?.current?.()?.lang ?? DEFAULT_LANGUAGE,
            ...options,
        });
    }

    async findOneByField(
        field: keyof T,
        value: T[keyof T],
        entityManager?: EntityManager,
    ): Promise<T | null> {
        try {
            const manager = entityManager || this._entityManager;
            const where: FindOptionsWhere<T> = { [field]: value } as any;
            return await manager.findOne(this.entity, {
                where,
            });
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' findOneByField: ${error}`,
            );
            throw error;
        }
    }

    async insertOne(
        data: Omit<T, 'id'>,
        entityManager?: EntityManager,
    ): Promise<T> {
        try {
            const manager = entityManager || this._entityManager;
            const entity = manager.create(this.entity, data as T);
            const result = await manager.save(entity);
            return result;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' insertOne: ${error}`,
            );
            throw error;
        }
    }

    async executeTransaction<R>(
        cb: (manager: EntityManager) => Promise<R>,
        entityManager?: EntityManager,
        retryOptions?: {
            maxRetries?: number;
            baseDelay?: number;
            enableRetry?: boolean;
        },
        uuid?: string,
    ) {
        const {
            maxRetries,
            baseDelay,
            enableRetry = true,
        } = retryOptions || {};

        const operation = async (): Promise<R> => {
            try {
                let result: R;
                if (entityManager) {
                    result = await cb(entityManager);
                } else {
                    await this._dataSource.transaction(async (manager) => {
                        manager.queryRunner['debugId'] = uuid || generateUuid();
                        result = await cb(manager);
                    });
                }
                return result;
            } catch (error) {
                this.logger.error(
                    `Error in BaseRepository of '${this.entity.name}' executeTransaction operation(): ${error}`,
                );
                throw error;
            }
        };

        if (enableRetry) {
            const result = await withRetry({
                operation,
                maxRetries,
                baseDelay,
                logger: this.logger,
                operationName: `Transaction in ${this.entity.name}`,
            });
            return result;
        } else {
            try {
                const result = await operation();
                return result;
            } catch (error) {
                this.logger.error(
                    `Error in BaseRepository of '${this.entity.name}' executeTransaction: ${error}`,
                );
                throw error;
            }
        }
    }

    async deleteManyByQuery(
        query: FindOptionsWhere<T>,
        deletedBy: number,
        entityManager?: EntityManager,
    ) {
        try {
            const manager = entityManager || this._entityManager;
            const [record] = await manager
                .createQueryBuilder()
                .update(this.entity)
                .set({
                    deletedAt: new Date(),
                    deletedBy: deletedBy,
                } as any)
                .where(query)
                .returning('*')
                .execute()
                .then((response) => response.raw);

            return record;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' deleteManyByQuery: ${error}`,
            );
            throw error;
        }
    }

    async hardDeleteManyByQuery(
        query: FindOptionsWhere<T>,
        entityManager?: EntityManager,
    ) {
        try {
            const manager = entityManager || this._entityManager;
            await manager.delete(this.entity, query);
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository hardDeleteManyByQuery: ${error}`,
            );
            throw error;
        }
    }

    generatePagination(
        queryBuilder: SelectQueryBuilder<T>,
        query: CommonListQuery,
        skipLimit: boolean = false,
    ) {
        const {
            page = DEFAULT_FIRST_PAGE,
            limit = DEFAULT_LIMIT_FOR_PAGINATION,
            orderBy = DEFAULT_ORDER_BY,
            orderDirection = DEFAULT_ORDER_DIRECTION,
        } = query;

        const offset = (Number(page) - 1) * Number(limit);

        // Apply pagination
        if (!skipLimit) {
            queryBuilder
                .offset(offset) // Use offset() instead of skip()
                .limit(Number(limit)); // Use limit() instead of take()
        }

        // Add table alias to prevent ambiguous column errors
        const tableName = queryBuilder.alias;

        // Add primary sort by the specified field
        if (
            queryBuilder?.expressionMap?.orderBys &&
            Object.keys(queryBuilder?.expressionMap?.orderBys).length > 0
        ) {
            queryBuilder.addOrderBy(
                `${tableName}.${orderBy}`,
                orderDirection.toUpperCase() as 'ASC' | 'DESC',
            );
        } else {
            queryBuilder.orderBy(
                `${tableName}.${orderBy}`,
                orderDirection.toUpperCase() as 'ASC' | 'DESC',
            );
        }

        // Add secondary sort by id to ensure consistent ordering when primary values are equal
        if (orderBy !== OrderBy.ID) {
            queryBuilder.addOrderBy(
                `${tableName}.${OrderBy.ID}`,
                orderDirection.toUpperCase() as 'ASC' | 'DESC',
            );
        }

        return queryBuilder;
    }

    async findOneWithDeleted(
        baseConditions: FindOptionsWhere<T>,
        orConditions?: FindOptionsWhere<T>[],
        entityManager?: EntityManager,
    ): Promise<T | null> {
        try {
            const manager = entityManager || this._entityManager;
            const queryBuilder = manager
                .createQueryBuilder(this.entity, 'entity')
                .withDeleted();

            queryBuilder.where(baseConditions);

            if (orConditions && orConditions.length > 0) {
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        orConditions.forEach((condition, index) => {
                            if (index === 0) {
                                qb.where(condition);
                            } else {
                                qb.orWhere(condition);
                            }
                        });
                    }),
                );
            }

            return await queryBuilder.getOne();
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' findOneWithDeleted: ${error}`,
            );
            throw error;
        }
    }

    async insertMany(
        data: SchemaCreateEntity<T>[],
        entityManager?: EntityManager,
    ): Promise<T[]> {
        try {
            const manager = entityManager || this._entityManager;
            const entities = manager.create(
                this.entity,
                data as unknown as DeepPartial<T>[],
            );
            return await manager.save(entities);
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' insertMany: ${error}`,
            );
            throw error;
        }
    }

    async getLastActivityByQuery(
        query: FindOptionsWhere<T>,
        fieldSort: keyof T,
        orderDirection: OrderDirection = OrderDirection.DESC,
    ) {
        try {
            const lastActivity = await this.findOne({
                where: query,
                order: {
                    [fieldSort]: orderDirection,
                } as any,
            });
            return lastActivity;
        } catch (error) {
            this.logger.error(
                `Error in UserPerformerInteractionRepository getLastActivityByQuery: ${error}`,
            );
            throw error;
        }
    }

    async findManyByQuery(options: {
        query: FindOptionsWhere<T>;
        attributes?: (keyof T)[];
        entityManager?: EntityManager;
        order?: { [P in keyof T]?: OrderDirection };
    }): Promise<T[]> {
        try {
            const { query, attributes, entityManager, order } = options;
            const manager = entityManager || this._entityManager;

            const data = await manager.find(this.entity, {
                where: query,
                select: attributes as any,
                order: order as any,
            });

            return data;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' findManyByQuery: ${error}`,
            );
            throw error;
        }
    }

    async findManyByQueryWithDeleted(options: {
        query: FindOptionsWhere<T>;
        attributes?: (keyof T)[];
        entityManager?: EntityManager;
        order?: { [P in keyof T]?: OrderDirection };
    }): Promise<T[]> {
        try {
            const { query, attributes, entityManager, order } = options;
            const manager = entityManager || this._entityManager;

            const queryBuilder = manager
                .createQueryBuilder(this.entity, 'entity')
                .withDeleted()
                .where(query);

            if (attributes && attributes.length > 0) {
                queryBuilder.select(
                    attributes.map((attr) => `entity.${String(attr)}`),
                );
            }

            if (order) {
                Object.entries(order).forEach(([key, direction]) => {
                    queryBuilder.addOrderBy(`entity.${key}`, direction);
                });
            }

            const data = await queryBuilder.getMany();
            return data;
        } catch (error) {
            this.logger.error(
                `Error in BaseRepository of '${this.entity.name}' findManyByQueryWithDeleted: ${error}`,
            );
            throw error;
        }
    }
}
