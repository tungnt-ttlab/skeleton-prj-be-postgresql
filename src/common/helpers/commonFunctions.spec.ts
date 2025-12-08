import * as commonFunctions from './commonFunctions';
import bcrypt from 'bcrypt';
import dayjs from '../../plugins/dayjs';

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('uuid-mock') }));

// Mock Joi before importing commonFunctions
jest.mock('src/plugins/joi', () => ({
    object: jest.fn().mockReturnValue({ validate: jest.fn() }),
    number: jest.fn().mockReturnValue({
        min: jest.fn().mockReturnThis(),
        max: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        allow: jest.fn().mockReturnThis(),
    }),
    string: jest.fn().mockReturnValue({
        min: jest.fn().mockReturnThis(),
        max: jest.fn().mockReturnThis(),
        valid: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        allow: jest.fn().mockReturnThis(),
    }),
    boolean: jest.fn().mockReturnValue({
        optional: jest.fn().mockReturnThis(),
    }),
    array: jest.fn().mockReturnValue({
        items: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
    }),
    date: jest.fn().mockReturnValue({
        optional: jest.fn().mockReturnThis(),
    }),
    any: jest.fn().mockReturnValue({
        optional: jest.fn().mockReturnThis(),
    }),
    isParamId: jest.fn().mockReturnValue({
        required: jest.fn().mockReturnThis(),
        label: jest.fn().mockReturnThis(),
    }),
    required: jest.fn().mockReturnThis(),
    label: jest.fn().mockReturnThis(),
}));

// Mock Reflect for testing
const mockReflect = {
    getMetadata: jest.fn(),
};
global.Reflect = mockReflect as any;

describe('commonFunctions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('customFormat', () => {
        it('should format error message correctly', () => {
            const error = {
                [Symbol.for('message')]: 'Test error\nwith newline',
                level: 'error',
                message: 'Test error',
            } as any;
            const result = commonFunctions.customFormat.transform(error);
            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('level', 'error');
            expect(result).toHaveProperty('message');
        });
        it('should handle error without message', () => {
            const error = { level: 'error', message: '' } as any;
            const result = commonFunctions.customFormat.transform(error);
            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('level', 'error');
        });
    });

    describe('convertClassToJoiRawObject', () => {
        it('should return joi object from metadata', () => {
            const mockJoiObject = { field: {} as any };
            mockReflect.getMetadata.mockReturnValue(mockJoiObject);

            class TestClass {}
            const result =
                commonFunctions.convertClassToJoiRawObject(TestClass);

            expect(result).toEqual(mockJoiObject);
            expect(mockReflect.getMetadata).toHaveBeenCalledWith(
                'JOI_TestClass',
                TestClass.prototype.constructor,
            );
        });
        it('should merge parent metadata', () => {
            const parentJoiObject = { parentField: {} as any };
            const childJoiObject = { childField: {} as any };
            mockReflect.getMetadata
                .mockReturnValueOnce(parentJoiObject) // parent metadata
                .mockReturnValueOnce(childJoiObject); // child metadata

            class ParentClass {}
            class ChildClass extends ParentClass {}

            const result =
                commonFunctions.convertClassToJoiRawObject(ChildClass);

            expect(result).toEqual({
                parentField: {},
                childField: {},
            });
        });
        it('should return empty object when no metadata', () => {
            mockReflect.getMetadata.mockReturnValue(undefined);

            class TestClass {}
            const result =
                commonFunctions.convertClassToJoiRawObject(TestClass);

            expect(result).toEqual({});
        });
        it('should handle error and return undefined', () => {
            mockReflect.getMetadata.mockImplementation(() => {
                throw new Error('Metadata error');
            });

            class TestClass {}
            const result =
                commonFunctions.convertClassToJoiRawObject(TestClass);

            expect(result).toBeUndefined();
        });
    });

    describe('convertClassToJoiObjectSchema', () => {
        it('should return Joi object schema', () => {
            const mockJoiObject = { field: {} as any };
            jest.spyOn(
                commonFunctions,
                'convertClassToJoiRawObject',
            ).mockReturnValue(mockJoiObject);

            class TestClass {}
            const result =
                commonFunctions.convertClassToJoiObjectSchema(TestClass);

            expect(result).toBeDefined();
            expect(
                commonFunctions.convertClassToJoiRawObject,
            ).toHaveBeenCalledWith(TestClass);
        });
        it('should return undefined when no raw object', () => {
            jest.spyOn(
                commonFunctions,
                'convertClassToJoiRawObject',
            ).mockReturnValue(undefined);

            class TestClass {}
            const result =
                commonFunctions.convertClassToJoiObjectSchema(TestClass);

            expect(result).toBeUndefined();
        });
        it('should handle error and return undefined', () => {
            jest.spyOn(
                commonFunctions,
                'convertClassToJoiRawObject',
            ).mockImplementation(() => {
                throw new Error('Error');
            });

            class TestClass {}
            const result =
                commonFunctions.convertClassToJoiObjectSchema(TestClass);

            expect(result).toBeUndefined();
        });
    });

    describe('parseSelectAttribute', () => {
        it('should parse attributes with array fields', () => {
            const result = commonFunctions.parseSelectAttribute(
                'user',
                ['name', 'tags'],
                ['tags'],
            );
            expect(result).toEqual([
                'user.name AS "name"',
                'TO_JSON(user.tags) AS "tags"',
            ]);
        });
        it('should parse attributes without array fields', () => {
            const result = commonFunctions.parseSelectAttribute('user', [
                'name',
                'email',
            ]);
            expect(result).toEqual([
                'user.name AS "name"',
                'user.email AS "email"',
            ]);
        });
        it('should handle empty attributes', () => {
            const result = commonFunctions.parseSelectAttribute('user', []);
            expect(result).toEqual([]);
        });
        it('should handle undefined attributes', () => {
            const result = commonFunctions.parseSelectAttribute(
                'user',
                undefined as any,
            );
            expect(result).toBeUndefined();
        });
    });

    describe('parseSelectAttributeWithoutColumnAlias', () => {
        it('should parse attributes without column alias', () => {
            const result =
                commonFunctions.parseSelectAttributeWithoutColumnAlias('user', [
                    'name',
                    'email',
                ]);
            expect(result).toEqual(['user.name', 'user.email']);
        });
        it('should handle empty attributes', () => {
            const result =
                commonFunctions.parseSelectAttributeWithoutColumnAlias(
                    'user',
                    [],
                );
            expect(result).toEqual([]);
        });
        it('should handle undefined attributes', () => {
            const result =
                commonFunctions.parseSelectAttributeWithoutColumnAlias(
                    'user',
                    undefined as any,
                );
            expect(result).toBeUndefined();
        });
    });

    describe('parseJsonSelectAttributeWhenJoin', () => {
        it('should parse JSON select attribute for join', () => {
            const result = commonFunctions.parseJsonSelectAttributeWhenJoin(
                'user',
                ['name', 'email'],
            );
            expect(result).toContain('JSON_BUILD_OBJECT');
            expect(result).toContain("'name', user.name");
            expect(result).toContain("'email', user.email");
            expect(result).toContain('as "user"');
        });
        it('should handle empty attributes', () => {
            const result = commonFunctions.parseJsonSelectAttributeWhenJoin(
                'user',
                [],
            );
            expect(result).toContain('JSON_BUILD_OBJECT()');
        });
        it('should include COALESCE and CASE WHEN', () => {
            const result = commonFunctions.parseJsonSelectAttributeWhenJoin(
                'user',
                ['name'],
            );
            expect(result).toContain('COALESCE');
            expect(result).toContain('CASE');
            expect(result).toContain('WHEN user.id IS NULL');
        });
    });

    describe('extractToken', () => {
        it('should extract token from Bearer', () => {
            expect(commonFunctions.extractToken('Bearer abc')).toBe('abc');
        });
        it('should return empty string if no Bearer', () => {
            expect(commonFunctions.extractToken('abc')).toBe('');
        });
        it('should return empty string for empty input', () => {
            expect(commonFunctions.extractToken('')).toBe('');
        });
        it('should return empty string for undefined input', () => {
            expect(commonFunctions.extractToken()).toBe('');
        });
    });

    describe('hashPassword', () => {
        it('should hash password', () => {
            const hash = commonFunctions.hashPassword('123456');
            expect(typeof hash).toBe('string');
            expect(hash.length).toBeGreaterThan(10);
        });
        it('should match bcrypt hash', () => {
            const hash = commonFunctions.hashPassword('test');
            expect(bcrypt.compareSync('test', hash)).toBe(true);
        });
    });

    describe('convertTimeToUTC', () => {
        it('should convert date to UTC', () => {
            const date = new Date('2024-01-01T10:00:00+09:00');
            const utc = commonFunctions.convertTimeToUTC(date);
            expect(utc instanceof Date).toBe(true);
        });
        it('should convert string to UTC', () => {
            const utc = commonFunctions.convertTimeToUTC(
                '2024-01-01T10:00:00+09:00',
            );
            expect(utc instanceof Date).toBe(true);
        });
    });

    describe('isEndOfDay', () => {
        it('should return true for 23:59:59', () => {
            jest.spyOn(dayjs, 'tz').mockReturnValue({
                format: () => '23:59:59',
                toDate: () => new Date(),
            } as any);
            expect(commonFunctions.isEndOfDay('2024-01-01')).toBe(true);
        });
        it('should return false for 12:00:00', () => {
            jest.spyOn(dayjs, 'tz').mockReturnValue({
                format: () => '12:00:00',
                toDate: () => new Date(),
            } as any);
            expect(commonFunctions.isEndOfDay('2024-01-01')).toBe(false);
        });
        it('should use custom timezone', () => {
            jest.spyOn(dayjs, 'tz').mockReturnValue({
                format: () => '23:59:59',
                toDate: () => new Date(),
            } as any);
            expect(commonFunctions.isEndOfDay('2024-01-01', 'Asia/Tokyo')).toBe(
                true,
            );
        });
    });

    describe('isStartOfDay', () => {
        it('should return true for 00:00:00', () => {
            jest.spyOn(dayjs, 'tz').mockReturnValue({
                format: () => '00:00:00',
                toDate: () => new Date(),
            } as any);
            expect(commonFunctions.isStartOfDay('2024-01-01')).toBe(true);
        });
        it('should return false for 12:00:00', () => {
            jest.spyOn(dayjs, 'tz').mockReturnValue({
                format: () => '12:00:00',
                toDate: () => new Date(),
            } as any);
            expect(commonFunctions.isStartOfDay('2024-01-01')).toBe(false);
        });
        it('should use custom timezone', () => {
            jest.spyOn(dayjs, 'tz').mockReturnValue({
                format: () => '00:00:00',
                toDate: () => new Date(),
            } as any);
            expect(
                commonFunctions.isStartOfDay('2024-01-01', 'Asia/Tokyo'),
            ).toBe(true);
        });
    });

    describe('parseToCamelCase', () => {
        it('should convert keys to camelCase', () => {
            const obj = { snake_case: 1, PascalCase: 2 };
            const result = commonFunctions.parseToCamelCase(obj);
            expect(result).toHaveProperty('snakeCase');
            expect(result).toHaveProperty('pascalCase');
        });
        it('should handle empty object', () => {
            const result = commonFunctions.parseToCamelCase({});
            expect(result).toEqual({});
        });
    });

    describe('generateRandomString', () => {
        it('should generate string of given length', () => {
            const str = commonFunctions.generateRandomString(10);
            expect(typeof str).toBe('string');
            expect(str.length).toBe(10);
        });
        it('should generate different strings', () => {
            const str1 = commonFunctions.generateRandomString(10);
            const str2 = commonFunctions.generateRandomString(10);
            expect(str1).not.toBe(str2);
        });
    });

    describe('generateRandomCode', () => {
        it('should generate numeric code of given length', () => {
            const code = commonFunctions.generateRandomCode(6);
            expect(typeof code).toBe('string');
            expect(code.length).toBe(6);
            expect(/^\d+$/.test(code)).toBe(true);
        });
        it('should generate different codes', () => {
            const code1 = commonFunctions.generateRandomCode(4);
            const code2 = commonFunctions.generateRandomCode(4);
            expect(code1).not.toBe(code2);
        });
    });

    describe('generateESSortQuery', () => {
        it('should generate default sort query', () => {
            const result = commonFunctions.generateESSortQuery();
            expect(result).toEqual([
                { _score: { order: 'desc' } },
                { id: { order: 'desc' } },
            ]);
        });
        it('should generate custom sort query', () => {
            const result = commonFunctions.generateESSortQuery('name', 'asc');
            expect(result).toEqual([
                { name: { order: 'asc' } },
                { id: { order: 'desc' } },
            ]);
        });
    });

    describe('roundMoney', () => {
        it('should round down money', () => {
            expect(commonFunctions.roundMoney(10.9)).toBe(10);
            expect(commonFunctions.roundMoney(10.1)).toBe(10);
            expect(commonFunctions.roundMoney(10)).toBe(10);
        });
    });

    describe('roundTax', () => {
        it('should return tax as is', () => {
            expect(commonFunctions.roundTax(10.5)).toBe(10.5);
            expect(commonFunctions.roundTax(10)).toBe(10);
        });
    });

    describe('roundPoint', () => {
        it('should round up points', () => {
            expect(commonFunctions.roundPoint(10.1)).toBe(11);
            expect(commonFunctions.roundPoint(10.9)).toBe(11);
            expect(commonFunctions.roundPoint(10)).toBe(10);
        });
    });

    describe('generateUuid', () => {
        it('should call uuidv4', () => {
            expect(commonFunctions.generateUuid()).toBe('uuid-mock');
        });
    });

    describe('removeCommonProperty', () => {
        it('should remove common properties', () => {
            const obj = {
                id: 1,
                name: 'test',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                deletedBy: null,
                createdBy: 'user',
                updatedBy: 'user',
                customField: 'value',
            };
            const result = commonFunctions.removeCommonProperty(obj);
            expect(result).toEqual({ name: 'test', customField: 'value' });
        });
        it('should handle object without common properties', () => {
            const obj = { name: 'test', value: 123 };
            const result = commonFunctions.removeCommonProperty(obj);
            expect(result).toEqual({ name: 'test', value: 123 });
        });
    });

    describe('calculateTax', () => {
        it('should calculate tax correctly', () => {
            expect(commonFunctions.calculateTax(100, 10)).toBe(10);
            expect(commonFunctions.calculateTax(200, 5)).toBe(10);
            expect(commonFunctions.calculateTax(0, 10)).toBe(0);
        });
    });

    describe('calculatePointFromSalesPrice', () => {
        it('should calculate points correctly', () => {
            expect(
                commonFunctions.calculatePointFromSalesPrice(100, 10, 10),
            ).toBe(10);
            expect(
                commonFunctions.calculatePointFromSalesPrice(200, 20, 5),
            ).toBe(10);
        });
    });

    describe('calculateUnitPriceIncludeTax', () => {
        it('should calculate unit price with tax', () => {
            expect(commonFunctions.calculateUnitPriceIncludeTax(100, 10)).toBe(
                110,
            );
            expect(commonFunctions.calculateUnitPriceIncludeTax(200, 5)).toBe(
                210,
            );
        });
    });

    describe('calculateNormalPointBaseOnSetting', () => {
        it('should calculate points correctly', () => {
            expect(
                commonFunctions.calculateNormalPointBaseOnSetting(100, 10),
            ).toBe(10);
            expect(
                commonFunctions.calculateNormalPointBaseOnSetting(100, 15),
            ).toBe(7);
        });
        it('should return 0 for zero based price', () => {
            expect(
                commonFunctions.calculateNormalPointBaseOnSetting(100, 0),
            ).toBe(0);
        });
        it('should round up decimal results', () => {
            expect(
                commonFunctions.calculateNormalPointBaseOnSetting(100, 30),
            ).toBe(4);
        });
    });

    describe('appendSizeToFilename', () => {
        it('should append size to filename with extension', () => {
            expect(
                commonFunctions.appendSizeToFilename('image.jpg', 'thumb'),
            ).toBe('image_thumb.jpg');
            expect(
                commonFunctions.appendSizeToFilename('document.pdf', 'large'),
            ).toBe('document_large.pdf');
        });
        it('should append size to filename without extension', () => {
            expect(commonFunctions.appendSizeToFilename('file', 'small')).toBe(
                'file_small',
            );
        });
        it('should handle filename with multiple dots', () => {
            expect(
                commonFunctions.appendSizeToFilename('file.name.txt', 'medium'),
            ).toBe('file.name_medium.txt');
        });
    });

    describe('compareByString', () => {
        it('should compare by string', () => {
            expect(commonFunctions.compareByString(1, '1')).toBe(true);
            expect(commonFunctions.compareByString('abc', 'abc')).toBe(true);
            expect(commonFunctions.compareByString('abc', 'def')).toBe(false);
        });
        it('should handle null/undefined values', () => {
            expect(commonFunctions.compareByString(null, null)).toBe(true);
            expect(commonFunctions.compareByString(undefined, undefined)).toBe(
                true,
            );
            expect(commonFunctions.compareByString(null, '1')).toBe(false);
            expect(commonFunctions.compareByString('1', null)).toBe(false);
        });
    });

    describe('convertToNumberArray', () => {
        it('should convert string to number array', () => {
            expect(commonFunctions.convertToNumberArray('123')).toEqual([123]);
        });
        it('should convert string array to number array', () => {
            expect(
                commonFunctions.convertToNumberArray(['1', '2', '3']),
            ).toEqual([1, 2, 3]);
        });
        it('should return number array as is', () => {
            expect(commonFunctions.convertToNumberArray([1, 2, 3])).toEqual([
                1, 2, 3,
            ]);
        });
        it('should handle mixed array', () => {
            expect(
                commonFunctions.convertToNumberArray(['1', 2, '3'] as any),
            ).toEqual([1, 2, 3]);
        });
    });

    describe('getFileNameFromPath', () => {
        it('should get file name from path', () => {
            expect(commonFunctions.getFileNameFromPath('a/b/c.txt')).toBe(
                'c.txt',
            );
            expect(commonFunctions.getFileNameFromPath('file.txt')).toBe(
                'file.txt',
            );
            expect(commonFunctions.getFileNameFromPath('')).toBeNull();
        });
        it('should handle null/undefined path', () => {
            expect(commonFunctions.getFileNameFromPath(null)).toBeNull();
            expect(commonFunctions.getFileNameFromPath(undefined)).toBeNull();
        });
        it('should handle path with multiple slashes', () => {
            expect(
                commonFunctions.getFileNameFromPath('/a/b/c/d/file.txt'),
            ).toBe('file.txt');
        });
    });
});
