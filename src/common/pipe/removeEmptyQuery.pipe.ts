import { PipeTransform, Injectable } from '@nestjs/common';
import trim from 'lodash/trim';
import mapKeys from 'lodash/mapKeys';
import isArray from 'lodash/isArray';

type QueryType =
    | string
    | number
    | number[]
    | string[]
    | Record<string, string | number>
    | Record<string, string | number>[];
@Injectable()
export class RemoveEmptyQueryPipe implements PipeTransform {
    private isEmptyValue(value: any): boolean {
        return (
            (value !== 0 && !value) ||
            (typeof value === 'string' && !trim(value))
        );
    }

    removeEmptyValue(query: QueryType): void {
        const removeEmpty = (item: any) => {
            mapKeys(item, (value, key) => {
                if (this.isEmptyValue(value)) {
                    delete item[key];
                } else if (isArray(value)) {
                    item[key] = value.filter(
                        (property) => !this.isEmptyValue(property),
                    );
                }
            });
        };
        removeEmpty(query);
    }

    transform(query: Record<string, string>) {
        this.removeEmptyValue(query);
        return query;
    }
}
