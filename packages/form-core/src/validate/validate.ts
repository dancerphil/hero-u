import { get, set } from 'lodash-es';
import { Path, PathSegment } from '../path.js';

export type ValidateSetErrors = (path: Path | PathSegment, error: any) => void;

export type ValidateShould = (path: Path | PathSegment, shouldBe: (value: any) => boolean, error: any) => void;
export type ValidateShouldNot = (path: Path | PathSegment, shouldNotBe: (value: any) => boolean, error: any) => void;

export interface ValidateHelpers {
    setErrors: ValidateSetErrors;
    should: ValidateShould;
    shouldNot: ValidateShouldNot;
}

export type Validator<T = any> = (values: T, helpers: ValidateHelpers, params?: any) => void;

export const createValidate = <T>(validator: Validator<T>, params?: any) => {
    const validate = (values: T) => {
        const errors: any = {};
        const setErrors: ValidateSetErrors = (path, error) => {
            set(errors, path, error);
        };
        const should: ValidateShould = (path, shouldBe, error) => {
            if (!shouldBe(get(values, path))) {
                set(errors, path, error);
            }
        };
        const shouldNot: ValidateShould = (path, shouldNotBe, error) => {
            if (shouldNotBe(get(values, path))) {
                set(errors, path, error);
            }
        };
        validator(values, { setErrors, should, shouldNot }, params);
        return errors;
    };
    return validate;
};
