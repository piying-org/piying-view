import * as _angular_core from '@angular/core';
import { ComponentRef, CreateEffectOptions, CreateSignalOptions, DestroyableInjector, EffectRef, ElementRef, EventEmitter, InjectionToken, Injector, InputSignal, InputSignalWithTransform, OnChanges, OnDestroy, OutputEmitterRef, Provider, Signal, SimpleChange, SimpleChanges, StaticProvider, TemplateRef, Type, ViewContainerRef, WritableSignal } from '@angular/core';
import { ControlValueAccessor as ControlValueAccessor$1, NgControl } from '@angular/forms';
import * as _piying_valibot_visit from '@piying/valibot-visit';
import { BaseSchemaHandle, ConvertOptions, DefaultSchema, DefineTypeAction, EnumSchema as EnumSchema$2, IntersectSchema as IntersectSchema$2, LazySchema as LazySchema$2, MetadataAction as MetadataAction$1, MetadataListAction, ObjectSchema as ObjectSchema$2, RawConfig, RawConfigAction, RawConfigActionCommon, RawConfigCommon, Schema as Schema$1, SchemaOrPipe, TupleSchema as TupleSchema$2, UnionSchema as UnionSchema$2, VoidSchema as VoidSchema$2, asControl as asControl$1, asVirtualGroup as asVirtualGroup$1, changeObject, condition as condition$1, getDefaults as getDefaults$1, getSchemaByIssuePath, getSchemaMetadata } from '@piying/valibot-visit';
import { ClassValue } from 'clsx';
import * as rxjs from 'rxjs';
import { BehaviorSubject as BehaviorSubject$1, Observable, OperatorFunction, Subject, UnaryFunction } from 'rxjs';

declare function assert<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, input: unknown): asserts input is InferInput<TSchema>;
interface Cache$1<TValue$1> {
	/**
	* Creates a cache key from input and config.
	*
	* Hint: Primitive inputs are keyed by value. Object and function inputs are
	* keyed by reference identity.
	*/
	key(input: unknown, config?: Config<BaseIssue<unknown>>): string;
	/**
	* Gets a value from the cache by key.
	*/
	get(key: string): TValue$1 | undefined;
	/**
	* Sets a value in the cache by key.
	*/
	set(key: string, value: TValue$1): void;
	/**
	* Clears all entries from the cache.
	*/
	clear(): void;
}
/**
* Cache config type.
*
* @beta
*/
export interface CacheConfig {
	/**
	* The maximum number of items to cache.
	*
	* @default 1000
	*/
	maxSize?: number;
	/**
	* The maximum age of a cache entry in milliseconds.
	*
	* @default Infinity
	*/
	maxAge?: number;
}
//#endregion
//#region src/methods/cache/cache.d.ts
/**
* Schema with cache type.
*
* @beta
*/
export type SchemaWithCache<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TCacheConfig extends CacheConfig | undefined> = TSchema & {
	/**
	* The cache config.
	*/
	readonly cacheConfig: TCacheConfig;
	/**
	* The cache instance.
	*/
	readonly cache: Cache$1<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
};
declare function cache<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): SchemaWithCache<TSchema, undefined>;
declare function cache<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TCacheConfig extends CacheConfig | undefined>(schema: TSchema, config: TCacheConfig): SchemaWithCache<TSchema, TCacheConfig>;
//#endregion
//#region src/methods/cache/cacheAsync.d.ts
/**
* Schema with cache async type.
*
* @beta
*/
export type SchemaWithCacheAsync<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TCacheConfig extends CacheConfig | undefined> = Omit<TSchema, "async" | "~standard" | "~run"> & {
	/**
	* Whether it's async.
	*/
	readonly async: true;
	/**
	* The cache config.
	*/
	readonly cacheConfig: TCacheConfig;
	/**
	* The cache instance.
	*/
	readonly cache: Cache$1<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferInput<TSchema>, InferOutput<TSchema>>;
	/**
	* Parses unknown input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
};
declare function cacheAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): SchemaWithCacheAsync<TSchema, undefined>;
declare function cacheAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TCacheConfig extends CacheConfig | undefined>(schema: TSchema, config: TCacheConfig): SchemaWithCacheAsync<TSchema, TCacheConfig>;
declare function config<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, config: Config<InferIssue<TSchema>>): TSchema;
//#endregion
//#region src/methods/fallback/fallback.d.ts
/**
* Fallback type.
*/
export type Fallback<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>> = MaybeDeepReadonly<InferOutput<TSchema>> | ((dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>, config?: Config<InferIssue<TSchema>>) => MaybeDeepReadonly<InferOutput<TSchema>>);
/**
* Schema with fallback type.
*/
export type SchemaWithFallback<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TFallback$1 extends Fallback<TSchema>> = TSchema & {
	/**
	* The fallback value.
	*/
	readonly fallback: TFallback$1;
};
declare function fallback<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TFallback$1 extends Fallback<TSchema>>(schema: TSchema, fallback: TFallback$1): SchemaWithFallback<TSchema, TFallback$1>;
//#endregion
//#region src/methods/fallback/fallbackAsync.d.ts
/**
* Fallback async type.
*/
export type FallbackAsync<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = MaybeDeepReadonly<InferOutput<TSchema>> | ((dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>, config?: Config<InferIssue<TSchema>>) => MaybePromise<MaybeDeepReadonly<InferOutput<TSchema>>>);
/**
* Schema with fallback async type.
*/
export type SchemaWithFallbackAsync<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TFallback$1 extends FallbackAsync<TSchema>> = Omit<TSchema, "async" | "~standard" | "~run"> & {
	/**
	* The fallback value.
	*/
	readonly fallback: TFallback$1;
	/**
	* Whether it's async.
	*/
	readonly async: true;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferInput<TSchema>, InferOutput<TSchema>>;
	/**
	* Parses unknown input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
};
declare function fallbackAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TFallback$1 extends FallbackAsync<TSchema>>(schema: TSchema, fallback: TFallback$1): SchemaWithFallbackAsync<TSchema, TFallback$1>;
//#endregion
//#region src/methods/flatten/flatten.d.ts
/**
* Flat errors type.
*/
export type FlatErrors<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | undefined> = Prettify<{
	/**
	* The root errors.
	*
	* Hint: The error messages of issues without a path that belong to the root
	* of the schema are added to this key.
	*/
	readonly root?: [
		string,
		...string[]
	];
	/**
	* The nested errors.
	*
	* Hint: The error messages of issues with a path that belong to the nested
	* parts of the schema and can be converted to a dot path are added to this
	* key.
	*/
	readonly nested?: Prettify<Readonly<Partial<Record<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> ? IssueDotPath<TSchema> : string, [
		string,
		...string[]
	]>>>>;
	/**
	* The other errors.
	*
	* Hint: Some issue paths, for example for complex data types like `Set` and
	* `Map`, have no key or a key that cannot be converted to a dot path. These
	* error messages are added to this key.
	*/
	readonly other?: [
		string,
		...string[]
	];
}>;
declare function flatten(issues: readonly [
	BaseIssue<unknown>,
	...BaseIssue<unknown>[]
]): FlatErrors<undefined>;
declare function flatten<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(issues: readonly [
	InferIssue<TSchema>,
	...InferIssue<TSchema>[]
]): FlatErrors<TSchema>;
//#endregion
//#region src/methods/forward/types.d.ts
/**
* Extracts the exact keys of a tuple, array or object.
*/
export type KeyOf$1<TValue$1> = IsAny<TValue$1> extends true ? never : TValue$1 extends readonly unknown[] ? number extends TValue$1["length"] ? number : {
	[TKey in keyof TValue$1]: TKey extends `${infer TIndex extends number}` ? TIndex : never;
}[number] : TValue$1 extends Record<string, unknown> ? keyof TValue$1 & (string | number) : never;
/**
* Path type.
*/
export type Path$1 = readonly (string | number)[];
/**
* Required path type.
*/
export type RequiredPath$1 = readonly [
	string | number,
	...Path$1
];
/**
* Lazily evaluate only the first valid path segment based on the given value.
*/
export type LazyPath$1<TValue$1, TPathToCheck extends Path$1, TValidPath extends Path$1 = readonly [
]> = TPathToCheck extends readonly [
] ? TValidPath : TPathToCheck extends readonly [
	infer TFirstKey extends KeyOf$1<TValue$1> & keyof TValue$1,
	...infer TPathRest extends Path$1
] ? LazyPath$1<TValue$1[TFirstKey], TPathRest, readonly [
	...TValidPath,
	TFirstKey
]> : IsNever<KeyOf$1<TValue$1>> extends false ? readonly [
	...TValidPath,
	KeyOf$1<TValue$1>
] : TValidPath;
/**
* Returns the path if valid, otherwise the first possible valid path based on
* the given value.
*/
export type ValidPath$1<TValue$1 extends Record<string, unknown> | ArrayLike<unknown>, TPath extends RequiredPath$1> = TPath extends LazyPath$1<TValue$1, TPath> ? TPath : LazyPath$1<TValue$1, TPath>;
declare function forward<TInput$1 extends Record<string, unknown> | ArrayLike<unknown>, TIssue extends BaseIssue<unknown>, const TPath extends RequiredPath$1>(action: BaseValidation<TInput$1, TInput$1, TIssue>, path: ValidPath$1<TInput$1, TPath>): BaseValidation<TInput$1, TInput$1, TIssue>;
declare function forwardAsync<TInput$1 extends Record<string, unknown> | ArrayLike<unknown>, TIssue extends BaseIssue<unknown>, const TPath extends RequiredPath$1>(action: BaseValidation<TInput$1, TInput$1, TIssue> | BaseValidationAsync<TInput$1, TInput$1, TIssue>, path: ValidPath$1<TInput$1, TPath>): BaseValidationAsync<TInput$1, TInput$1, TIssue>;
//#endregion
//#region src/methods/getDefault/getDefault.d.ts
/**
* Schema with default type.
*/
export type SchemaWithDefault = ExactOptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | NullableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | NullishSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | UndefinedableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>;
/**
* Schema with default async type.
*/
export type SchemaWithDefaultAsync = ExactOptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | NullableSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | NullishSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | UndefinedableSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown>;
/**
* Infer default type.
*/
export type InferDefault<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | SchemaWithDefault | SchemaWithDefaultAsync> = TSchema extends SchemaWithDefault | SchemaWithDefaultAsync ? TSchema["default"] extends ((...args: any) => any) ? ReturnType<TSchema["default"]> : TSchema["default"] : undefined;
declare function getDefault<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, dataset?: UnknownDataset, config?: Config<InferIssue<TSchema>>): InferDefault<TSchema>;
//#endregion
//#region src/methods/getDefaults/types.d.ts
/**
* Infer defaults type.
*/
export type InferDefaults<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? {
	-readonly [TKey in keyof TEntries]: InferDefaults<TEntries[TKey]>;
} : TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchemaAsync<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? {
	-readonly [TKey in keyof TEntries]: InferDefaults<TEntries[TKey]>;
} : TSchema extends LooseTupleSchema<infer TItems, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchema<infer TItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<infer TItems, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<infer TItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined> ? {
	-readonly [TKey in keyof TItems]: InferDefaults<TItems[TKey]>;
} : TSchema extends LooseTupleSchemaAsync<infer TItems, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchemaAsync<infer TItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchemaAsync<infer TItems, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchemaAsync<infer TItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined> ? {
	-readonly [TKey in keyof TItems]: InferDefaults<TItems[TKey]>;
} : Awaited<InferDefault<TSchema>>;
declare function getDefaults<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<TupleItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined>>(schema: TSchema): InferDefaults<TSchema>;
declare function getDefaultsAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> | LooseTupleSchemaAsync<TupleItemsAsync, ErrorMessage<LooseTupleIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined> | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined> | StrictTupleSchemaAsync<TupleItemsAsync, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> | TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<TupleItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined> | TupleWithRestSchemaAsync<TupleItemsAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined>>(schema: TSchema): Promise<InferDefaults<TSchema>>;
//#endregion
//#region src/methods/getDescription/getDescription.d.ts
/**
* Schema type.
*/
export type Schema$14 = BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | SchemaWithPipe<readonly [
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	...(PipeItem<any, unknown, BaseIssue<unknown>> | DescriptionAction<unknown, string>)[]
]> | SchemaWithPipeAsync<readonly [
	(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>),
	...(PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>> | DescriptionAction<unknown, string>)[]
]>;
declare function getDescription(schema: Schema$14): string | undefined;
//#endregion
//#region src/methods/getExamples/getExamples.d.ts
/**
* Schema type.
*/
export type Schema$13 = BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | SchemaWithPipe<readonly [
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	...(PipeItem<any, unknown, BaseIssue<unknown>> | ExamplesAction<unknown, readonly unknown[]>)[]
]> | SchemaWithPipeAsync<readonly [
	(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>),
	...(PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>> | ExamplesAction<unknown, readonly unknown[]>)[]
]>;
/**
* Recursively concat type.
*/
export type RecursiveConcat<TRootPipe extends readonly (PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>>)[], TCollectedExamples extends unknown[] = [
]> = TRootPipe extends readonly [
	infer TFirstItem,
	...infer TPipeRest extends readonly (PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>>)[]
] ? TFirstItem extends SchemaWithPipe<infer TNestedPipe> | SchemaWithPipeAsync<infer TNestedPipe> ? RecursiveConcat<TPipeRest, RecursiveConcat<TNestedPipe, TCollectedExamples>> : TFirstItem extends ExamplesAction<unknown, infer TCurrentExamples> ? RecursiveConcat<TPipeRest, [
	...TCollectedExamples,
	...TCurrentExamples
]> : RecursiveConcat<TPipeRest, TCollectedExamples> : TCollectedExamples;
/**
* Infer examples type.
*/
export type InferExamples<TSchema extends Schema$13> = TSchema extends SchemaWithPipe<infer TPipe> | SchemaWithPipeAsync<infer TPipe> ? Readonly<RecursiveConcat<TPipe>> : [
];
declare function getExamples<const TSchema extends Schema$13>(schema: TSchema): InferExamples<TSchema>;
//#endregion
//#region src/methods/getFallback/getFallback.d.ts
/**
* Infer fallback type.
*/
export type InferFallback<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TSchema extends SchemaWithFallback<BaseSchema<unknown, unknown, BaseIssue<unknown>>, infer TFallback> | SchemaWithFallbackAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, infer TFallback> ? TFallback extends MaybeDeepReadonly<InferOutput<TSchema>> ? TFallback : TFallback extends (() => MaybePromise<MaybeDeepReadonly<InferOutput<TSchema>>>) ? ReturnType<TFallback> : never : undefined;
declare function getFallback<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>, config?: Config<InferIssue<TSchema>>): InferFallback<TSchema>;
//#endregion
//#region src/methods/getFallbacks/types.d.ts
/**
* Infer fallbacks type.
*/
export type InferFallbacks<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? {
	-readonly [TKey in keyof TEntries]: InferFallbacks<TEntries[TKey]>;
} : TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchemaAsync<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? {
	-readonly [TKey in keyof TEntries]: InferFallbacks<TEntries[TKey]>;
} : TSchema extends LooseTupleSchema<infer TItems, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchema<infer TItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<infer TItems, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<infer TItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined> ? {
	-readonly [TKey in keyof TItems]: InferFallbacks<TItems[TKey]>;
} : TSchema extends LooseTupleSchemaAsync<infer TItems, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchemaAsync<infer TItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchemaAsync<infer TItems, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchemaAsync<infer TItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined> ? {
	-readonly [TKey in keyof TItems]: InferFallbacks<TItems[TKey]>;
} : Awaited<InferFallback<TSchema>>;
declare function getFallbacks<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<TupleItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined>>(schema: TSchema): InferFallbacks<TSchema>;
declare function getFallbacksAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> | LooseTupleSchemaAsync<TupleItemsAsync, ErrorMessage<LooseTupleIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined> | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined> | StrictTupleSchemaAsync<TupleItemsAsync, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> | TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<TupleItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined> | TupleWithRestSchemaAsync<TupleItemsAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined>>(schema: TSchema): Promise<InferFallbacks<TSchema>>;
//#endregion
//#region src/methods/pipe/pipe.d.ts
/**
* Schema with pipe type.
*/
export type SchemaWithPipe<TPipe$1 extends readonly [
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	...PipeItem<any, unknown, BaseIssue<unknown>>[]
]> = Omit<FirstTupleItem<TPipe$1>, "pipe" | "~standard" | "~run" | "~types"> & {
	/**
	* The pipe items.
	*/
	readonly pipe: TPipe$1;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferInput<FirstTupleItem<TPipe$1>>, InferOutput<LastTupleItem<TPipe$1>>>;
	/**
	* Parses unknown input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferOutput<LastTupleItem<TPipe$1>>, InferIssue<TPipe$1[number]>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferInput<FirstTupleItem<TPipe$1>>;
		readonly output: InferOutput<LastTupleItem<TPipe$1>>;
		readonly issue: InferIssue<TPipe$1[number]>;
	} | undefined;
};
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>, const TItem17 extends PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>, item17: TItem17 | PipeAction<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16,
	TItem17
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>, const TItem17 extends PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>>, const TItem18 extends PipeItem<InferOutput<TItem17>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>, item17: TItem17 | PipeAction<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>>, item18: TItem18 | PipeAction<InferOutput<TItem17>, InferOutput<TItem18>, InferIssue<TItem18>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16,
	TItem17,
	TItem18
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>, const TItem17 extends PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>>, const TItem18 extends PipeItem<InferOutput<TItem17>, unknown, BaseIssue<unknown>>, const TItem19 extends PipeItem<InferOutput<TItem18>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>, item17: TItem17 | PipeAction<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>>, item18: TItem18 | PipeAction<InferOutput<TItem17>, InferOutput<TItem18>, InferIssue<TItem18>>, item19: TItem19 | PipeAction<InferOutput<TItem18>, InferOutput<TItem19>, InferIssue<TItem19>>): SchemaWithPipe<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16,
	TItem17,
	TItem18,
	TItem19
]>;
declare function pipe$1<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TItems$1 extends readonly PipeItem<InferOutput<TSchema>, InferOutput<TSchema>, BaseIssue<unknown>>[]>(schema: TSchema, ...items: TItems$1): SchemaWithPipe<readonly [
	TSchema,
	...TItems$1
]>;
//#endregion
//#region src/methods/pipe/pipeAsync.d.ts
/**
* Schema with pipe async type.
*/
export type SchemaWithPipeAsync<TPipe$1 extends readonly [
	(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>),
	...(PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>>)[]
]> = Omit<FirstTupleItem<TPipe$1>, "async" | "pipe" | "~standard" | "~run" | "~types"> & {
	/**
	* The pipe items.
	*/
	readonly pipe: TPipe$1;
	/**
	* Whether it's async.
	*/
	readonly async: true;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferInput<FirstTupleItem<TPipe$1>>, InferOutput<LastTupleItem<TPipe$1>>>;
	/**
	* Parses unknown input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferOutput<LastTupleItem<TPipe$1>>, InferIssue<TPipe$1[number]>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferInput<FirstTupleItem<TPipe$1>>;
		readonly output: InferOutput<LastTupleItem<TPipe$1>>;
		readonly issue: InferIssue<TPipe$1[number]>;
	} | undefined;
};
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>> | PipeActionAsync<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>> | PipeActionAsync<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>> | PipeActionAsync<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>> | PipeActionAsync<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>> | PipeActionAsync<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>> | PipeActionAsync<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>> | PipeActionAsync<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>> | PipeActionAsync<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>> | PipeActionAsync<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>> | PipeActionAsync<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>, const TItem17 extends PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem16>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>> | PipeActionAsync<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>> | PipeActionAsync<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>> | PipeActionAsync<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>> | PipeActionAsync<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>, item17: TItem17 | PipeAction<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>> | PipeActionAsync<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16,
	TItem17
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>, const TItem17 extends PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem16>, unknown, BaseIssue<unknown>>, const TItem18 extends PipeItem<InferOutput<TItem17>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem17>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>> | PipeActionAsync<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>> | PipeActionAsync<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>> | PipeActionAsync<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>> | PipeActionAsync<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>, item17: TItem17 | PipeAction<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>> | PipeActionAsync<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>>, item18: TItem18 | PipeAction<InferOutput<TItem17>, InferOutput<TItem18>, InferIssue<TItem18>> | PipeActionAsync<InferOutput<TItem17>, InferOutput<TItem18>, InferIssue<TItem18>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16,
	TItem17,
	TItem18
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItem1 extends PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>, const TItem2 extends PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>, const TItem3 extends PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>, const TItem4 extends PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>, const TItem5 extends PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>, const TItem6 extends PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>, const TItem7 extends PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>, const TItem8 extends PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>, const TItem9 extends PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>, const TItem10 extends PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>, const TItem11 extends PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>, const TItem12 extends PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>, const TItem13 extends PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>, const TItem14 extends PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>, const TItem15 extends PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>, const TItem16 extends PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>, const TItem17 extends PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem16>, unknown, BaseIssue<unknown>>, const TItem18 extends PipeItem<InferOutput<TItem17>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem17>, unknown, BaseIssue<unknown>>, const TItem19 extends PipeItem<InferOutput<TItem18>, unknown, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TItem18>, unknown, BaseIssue<unknown>>>(schema: TSchema, item1: TItem1 | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>> | PipeActionAsync<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>, item2: TItem2 | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>> | PipeActionAsync<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>, item3: TItem3 | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>> | PipeActionAsync<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>, item4: TItem4 | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>> | PipeActionAsync<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>, item5: TItem5 | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>> | PipeActionAsync<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>, item6: TItem6 | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>> | PipeActionAsync<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>, item7: TItem7 | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>> | PipeActionAsync<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>, item8: TItem8 | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>> | PipeActionAsync<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>, item9: TItem9 | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>> | PipeActionAsync<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>, item10: TItem10 | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>> | PipeActionAsync<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>, item11: TItem11 | PipeAction<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>> | PipeActionAsync<InferOutput<TItem10>, InferOutput<TItem11>, InferIssue<TItem11>>, item12: TItem12 | PipeAction<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>> | PipeActionAsync<InferOutput<TItem11>, InferOutput<TItem12>, InferIssue<TItem12>>, item13: TItem13 | PipeAction<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>> | PipeActionAsync<InferOutput<TItem12>, InferOutput<TItem13>, InferIssue<TItem13>>, item14: TItem14 | PipeAction<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>> | PipeActionAsync<InferOutput<TItem13>, InferOutput<TItem14>, InferIssue<TItem14>>, item15: TItem15 | PipeAction<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>> | PipeActionAsync<InferOutput<TItem14>, InferOutput<TItem15>, InferIssue<TItem15>>, item16: TItem16 | PipeAction<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>> | PipeActionAsync<InferOutput<TItem15>, InferOutput<TItem16>, InferIssue<TItem16>>, item17: TItem17 | PipeAction<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>> | PipeActionAsync<InferOutput<TItem16>, InferOutput<TItem17>, InferIssue<TItem17>>, item18: TItem18 | PipeAction<InferOutput<TItem17>, InferOutput<TItem18>, InferIssue<TItem18>> | PipeActionAsync<InferOutput<TItem17>, InferOutput<TItem18>, InferIssue<TItem18>>, item19: TItem19 | PipeAction<InferOutput<TItem18>, InferOutput<TItem19>, InferIssue<TItem19>> | PipeActionAsync<InferOutput<TItem18>, InferOutput<TItem19>, InferIssue<TItem19>>): SchemaWithPipeAsync<readonly [
	TSchema,
	TItem1,
	TItem2,
	TItem3,
	TItem4,
	TItem5,
	TItem6,
	TItem7,
	TItem8,
	TItem9,
	TItem10,
	TItem11,
	TItem12,
	TItem13,
	TItem14,
	TItem15,
	TItem16,
	TItem17,
	TItem18,
	TItem19
]>;
declare function pipeAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TItems$1 extends readonly (PipeItem<InferOutput<TSchema>, InferOutput<TSchema>, BaseIssue<unknown>> | PipeItemAsync<InferOutput<TSchema>, InferOutput<TSchema>, BaseIssue<unknown>>)[]>(schema: TSchema, ...items: TItems$1): SchemaWithPipeAsync<readonly [
	TSchema,
	...TItems$1
]>;
//#endregion
//#region src/methods/getMetadata/getMetadata.d.ts
/**
* Schema type.
*/
export type Schema$12 = BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | SchemaWithPipe<readonly [
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	...(PipeItem<any, unknown, BaseIssue<unknown>> | MetadataAction<unknown, Record<string, unknown>>)[]
]> | SchemaWithPipeAsync<readonly [
	(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>),
	...(PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>> | MetadataAction<unknown, Record<string, unknown>>)[]
]>;
/**
* Basic pipe item type.
*/
export type BasicPipeItem = PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>> | MetadataAction<unknown, Record<string, unknown>>;
/**
* Recursive merge type.
*/
export type RecursiveMerge$1<TRootPipe extends readonly BasicPipeItem[], TCollectedMetadata extends Record<string, unknown> = {}> = TRootPipe extends readonly [
	infer TFirstItem,
	...infer TPipeRest extends readonly BasicPipeItem[]
] ? TFirstItem extends SchemaWithPipe<infer TNestedPipe> | SchemaWithPipeAsync<infer TNestedPipe> ? RecursiveMerge$1<TPipeRest, RecursiveMerge$1<TNestedPipe, TCollectedMetadata>> : TFirstItem extends MetadataAction<unknown, infer TCurrentMetadata> ? RecursiveMerge$1<TPipeRest, Merge<TCollectedMetadata, TCurrentMetadata>> : RecursiveMerge$1<TPipeRest, TCollectedMetadata> : TCollectedMetadata;
/**
* Infer metadata type.
*
* @beta
*/
export type InferMetadata<TSchema extends Schema$12> = BaseSchema<any, any, any> extends TSchema ? Record<string, unknown> : BaseSchemaAsync<any, any, any> extends TSchema ? Record<string, unknown> : TSchema extends SchemaWithPipe<infer TPipe> | SchemaWithPipeAsync<infer TPipe> ? Prettify<RecursiveMerge$1<TPipe>> : {};
declare function getMetadata<const TSchema extends Schema$12>(schema: TSchema): InferMetadata<TSchema>;
//#endregion
//#region src/actions/title/title.d.ts
/**
* Title action interface.
*/
export interface TitleAction<TInput$1, TTitle extends string> extends BaseMetadata<TInput$1> {
	/**
	* The action type.
	*/
	readonly type: "title";
	/**
	* The action reference.
	*/
	readonly reference: typeof title;
	/**
	* The title text.
	*/
	readonly title: TTitle;
}
declare function title<TInput$1, TTitle extends string>(title_: TTitle): TitleAction<TInput$1, TTitle>;
//#endregion
//#region src/methods/getTitle/getTitle.d.ts
/**
* Schema type.
*/
export type Schema$11 = BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | SchemaWithPipe<readonly [
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	...(PipeItem<any, unknown, BaseIssue<unknown>> | TitleAction<unknown, string>)[]
]> | SchemaWithPipeAsync<readonly [
	(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>),
	...(PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>> | TitleAction<unknown, string>)[]
]>;
declare function getTitle(schema: Schema$11): string | undefined;
declare function is<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, input: unknown): input is InferInput<TSchema>;
//#endregion
//#region src/methods/keyof/keyof.d.ts
/**
* Schema type.
*/
export type Schema$10 = LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>;
/**
* Force tuple type.
*/
export type ForceTuple<T> = T extends [
	string,
	...string[]
] ? T : [
];
/**
* Object keys type.
*/
export type ObjectKeys$1<TSchema extends Schema$10> = ForceTuple<UnionToTuple<keyof TSchema["entries"]>>;
declare function keyof<const TSchema extends Schema$10>(schema: TSchema): PicklistSchema<ObjectKeys$1<TSchema>, undefined>;
declare function keyof<const TSchema extends Schema$10, const TMessage extends ErrorMessage<PicklistIssue> | undefined>(schema: TSchema, message: TMessage): PicklistSchema<ObjectKeys$1<TSchema>, TMessage>;
declare function message<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, message_: ErrorMessage<InferIssue<TSchema>>): TSchema;
//#endregion
//#region src/methods/omit/omit.d.ts
/**
* Schema type.
*/
export type Schema$9 = SchemaWithoutPipe<LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>>;
/**
* Schema with omit type.
*/
export type SchemaWithOmit<TSchema extends Schema$9, TKeys extends ObjectKeys<TSchema>> = TSchema extends ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Omit<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Omit<TEntries, TKeys[number]>>, InferObjectOutput<Omit<TEntries, TKeys[number]>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<Omit<TEntries, TKeys[number]>>, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>>;
		readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>>;
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Omit<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Omit<TEntries, TKeys[number]>>, InferObjectOutput<Omit<TEntries, TKeys[number]>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<Omit<TEntries, TKeys[number]>>, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>>;
		readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>>;
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Omit<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, InferObjectInput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Omit<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, InferObjectInput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends ObjectWithRestSchema<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Omit<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: InferInput<TSchema["rest"]>;
	}, InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Omit<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: InferInput<TSchema["rest"]>;
		};
		readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: InferOutput<TSchema["rest"]>;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Omit<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>;
	} | undefined;
} : TSchema extends ObjectWithRestSchemaAsync<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Omit<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: InferInput<TSchema["rest"]>;
	}, InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Omit<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: InferInput<TSchema["rest"]>;
		};
		readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
			[key: string]: InferOutput<TSchema["rest"]>;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Omit<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>;
	} | undefined;
} : never;
declare function omit<const TSchema extends Schema$9, const TKeys extends ObjectKeys<TSchema>>(schema: TSchema, keys: TKeys): SchemaWithOmit<TSchema, TKeys>;
declare function parse<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, input: unknown, config?: Config<InferIssue<TSchema>>): InferOutput<TSchema>;
declare function parseAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, input: unknown, config?: Config<InferIssue<TSchema>>): Promise<InferOutput<TSchema>>;
//#endregion
//#region src/methods/parser/parser.d.ts
/**
* The parser interface.
*/
export interface Parser<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TConfig extends Config<InferIssue<TSchema>> | undefined> {
	/**
	* Parses an unknown input based on the schema.
	*/
	(input: unknown): InferOutput<TSchema>;
	/**
	* The schema to be used.
	*/
	readonly schema: TSchema;
	/**
	* The parser configuration.
	*/
	readonly config: TConfig;
}
declare function parser<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): Parser<TSchema, undefined>;
declare function parser<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TConfig extends Config<InferIssue<TSchema>> | undefined>(schema: TSchema, config: TConfig): Parser<TSchema, TConfig>;
//#endregion
//#region src/methods/parser/parserAsync.d.ts
/**
* The parser async interface.
*/
export interface ParserAsync<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TConfig extends Config<InferIssue<TSchema>> | undefined> {
	/**
	* Parses an unknown input based on the schema.
	*/
	(input: unknown): Promise<InferOutput<TSchema>>;
	/**
	* The schema to be used.
	*/
	readonly schema: TSchema;
	/**
	* The parser configuration.
	*/
	readonly config: TConfig;
}
declare function parserAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): ParserAsync<TSchema, undefined>;
declare function parserAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TConfig extends Config<InferIssue<TSchema>> | undefined>(schema: TSchema, config: TConfig): ParserAsync<TSchema, TConfig>;
//#endregion
//#region src/methods/partial/partial.d.ts
/**
* Schema type.
*/
export type Schema$8 = SchemaWithoutPipe<LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined>>;
/**
* Partial entries type.
*/
export type PartialEntries$1<TEntries$1 extends ObjectEntries, TKeys extends readonly (keyof TEntries$1)[] | undefined> = {
	[TKey in keyof TEntries$1]: TKeys extends readonly (keyof TEntries$1)[] ? TKey extends TKeys[number] ? OptionalSchema<TEntries$1[TKey], undefined> : TEntries$1[TKey] : OptionalSchema<TEntries$1[TKey], undefined>;
};
/**
* Schema with partial type.
*/
export type SchemaWithPartial<TSchema extends Schema$8, TKeys extends ObjectKeys<TSchema> | undefined> = TSchema extends ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: PartialEntries$1<TEntries, TKeys>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<PartialEntries$1<TEntries, TKeys>>, InferObjectOutput<PartialEntries$1<TEntries, TKeys>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<PartialEntries$1<TEntries, TKeys>>, InferIssue<TSchema>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<PartialEntries$1<TEntries, TKeys>>;
		readonly output: InferObjectOutput<PartialEntries$1<TEntries, TKeys>>;
		readonly issue: InferIssue<TSchema>;
	} | undefined;
} : TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: PartialEntries$1<TEntries, TKeys>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<PartialEntries$1<TEntries, TKeys>> & {
		[key: string]: unknown;
	}, InferObjectOutput<PartialEntries$1<TEntries, TKeys>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<PartialEntries$1<TEntries, TKeys>> & {
		[key: string]: unknown;
	}, InferIssue<TSchema>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<PartialEntries$1<TEntries, TKeys>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<PartialEntries$1<TEntries, TKeys>> & {
			[key: string]: unknown;
		};
		readonly issue: InferIssue<TSchema>;
	} | undefined;
} : TSchema extends ObjectWithRestSchema<infer TEntries, infer TRest, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: PartialEntries$1<TEntries, TKeys>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<PartialEntries$1<TEntries, TKeys>> & {
		[key: string]: InferInput<TRest>;
	}, InferObjectOutput<PartialEntries$1<TEntries, TKeys>> & {
		[key: string]: InferOutput<TRest>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<PartialEntries$1<TEntries, TKeys>> & {
		[key: string]: InferOutput<TRest>;
	}, InferIssue<TSchema>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<PartialEntries$1<TEntries, TKeys>> & {
			[key: string]: InferInput<TRest>;
		};
		readonly output: InferObjectOutput<PartialEntries$1<TEntries, TKeys>> & {
			[key: string]: InferOutput<TRest>;
		};
		readonly issue: InferIssue<TSchema>;
	} | undefined;
} : never;
declare function partial<const TSchema extends Schema$8>(schema: TSchema): SchemaWithPartial<TSchema, undefined>;
declare function partial<const TSchema extends Schema$8, const TKeys extends ObjectKeys<TSchema>>(schema: TSchema, keys: TKeys): SchemaWithPartial<TSchema, TKeys>;
//#endregion
//#region src/methods/partial/partialAsync.d.ts
/**
* Schema type.
*/
export type Schema$7 = SchemaWithoutPipe<LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>>;
/**
* Partial entries type.
*/
export type PartialEntries<TEntries$1 extends ObjectEntriesAsync, TKeys extends readonly (keyof TEntries$1)[] | undefined> = {
	[TKey in keyof TEntries$1]: TKeys extends readonly (keyof TEntries$1)[] ? TKey extends TKeys[number] ? OptionalSchemaAsync<TEntries$1[TKey], undefined> : TEntries$1[TKey] : OptionalSchemaAsync<TEntries$1[TKey], undefined>;
};
/**
* Schema with partial type.
*/
export type SchemaWithPartialAsync<TSchema extends Schema$7, TKeys extends ObjectKeys<TSchema> | undefined> = TSchema extends ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: PartialEntries<TEntries, TKeys>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<PartialEntries<TEntries, TKeys>>, InferObjectOutput<PartialEntries<TEntries, TKeys>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<PartialEntries<TEntries, TKeys>>, InferIssue<TSchema>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<PartialEntries<TEntries, TKeys>>;
		readonly output: InferObjectOutput<PartialEntries<TEntries, TKeys>>;
		readonly issue: InferIssue<TSchema>;
	} | undefined;
} : TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: PartialEntries<TEntries, TKeys>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<PartialEntries<TEntries, TKeys>> & {
		[key: string]: unknown;
	}, InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
		[key: string]: unknown;
	}, InferIssue<TSchema>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<PartialEntries<TEntries, TKeys>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
			[key: string]: unknown;
		};
		readonly issue: InferIssue<TSchema>;
	} | undefined;
} : TSchema extends ObjectWithRestSchemaAsync<infer TEntries, infer TRest, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: PartialEntries<TEntries, TKeys>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<PartialEntries<TEntries, TKeys>> & {
		[key: string]: InferInput<TRest>;
	}, InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
		[key: string]: InferOutput<TRest>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
		[key: string]: InferOutput<TRest>;
	}, InferIssue<TSchema>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<PartialEntries<TEntries, TKeys>> & {
			[key: string]: InferInput<TRest>;
		};
		readonly output: InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
			[key: string]: InferOutput<TRest>;
		};
		readonly issue: InferIssue<TSchema>;
	} | undefined;
} : never;
declare function partialAsync<const TSchema extends Schema$7>(schema: TSchema): SchemaWithPartialAsync<TSchema, undefined>;
declare function partialAsync<const TSchema extends Schema$7, const TKeys extends ObjectKeys<TSchema>>(schema: TSchema, keys: TKeys): SchemaWithPartialAsync<TSchema, TKeys>;
//#endregion
//#region src/methods/pick/pick.d.ts
/**
* The schema type.
*/
export type Schema$6 = SchemaWithoutPipe<LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>>;
/**
* Schema with pick type.
*/
export type SchemaWithPick<TSchema extends Schema$6, TKeys extends ObjectKeys<TSchema>> = TSchema extends ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Pick<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Pick<TEntries, TKeys[number]>>, InferObjectOutput<Pick<TEntries, TKeys[number]>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<Pick<TEntries, TKeys[number]>>, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Pick<TEntries, TKeys[number]>>;
		readonly output: InferObjectOutput<Pick<TEntries, TKeys[number]>>;
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Pick<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Pick<TEntries, TKeys[number]>>, InferObjectOutput<Pick<TEntries, TKeys[number]>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<Pick<TEntries, TKeys[number]>>, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Pick<TEntries, TKeys[number]>>;
		readonly output: InferObjectOutput<Pick<TEntries, TKeys[number]>>;
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Pick<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Pick<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: unknown;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: unknown;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Pick<TEntries, TKeys[number]>>;
	} | undefined;
} : TSchema extends ObjectWithRestSchema<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Pick<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: InferInput<TSchema["rest"]>;
	}, InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Pick<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: InferInput<TSchema["rest"]>;
		};
		readonly output: InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: InferOutput<TSchema["rest"]>;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Pick<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>;
	} | undefined;
} : TSchema extends ObjectWithRestSchemaAsync<infer TEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: Pick<TEntries, TKeys[number]>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: InferInput<TSchema["rest"]>;
	}, InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
		[key: string]: InferOutput<TSchema["rest"]>;
	}, Extract<InferIssue<TSchema>, {
		type: TSchema["type"];
	}> | InferObjectIssue<Pick<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: InferInput<TSchema["rest"]>;
		};
		readonly output: InferObjectOutput<Pick<TEntries, TKeys[number]>> & {
			[key: string]: InferOutput<TSchema["rest"]>;
		};
		readonly issue: Extract<InferIssue<TSchema>, {
			type: TSchema["type"];
		}> | InferObjectIssue<Pick<TEntries, TKeys[number]>> | InferIssue<TSchema["rest"]>;
	} | undefined;
} : never;
declare function pick<const TSchema extends Schema$6, const TKeys extends ObjectKeys<TSchema>>(schema: TSchema, keys: TKeys): SchemaWithPick<TSchema, TKeys>;
//#endregion
//#region src/methods/required/required.d.ts
/**
* Schema type.
*/
export type Schema$5 = SchemaWithoutPipe<LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined>>;
/**
* Required entries type.
*/
export type RequiredEntries$1<TEntries$1 extends ObjectEntries, TKeys extends readonly (keyof TEntries$1)[] | undefined, TMessage extends ErrorMessage<NonOptionalIssue> | undefined> = {
	[TKey in keyof TEntries$1]: TKeys extends readonly (keyof TEntries$1)[] ? TKey extends TKeys[number] ? NonOptionalSchema<TEntries$1[TKey], TMessage> : TEntries$1[TKey] : NonOptionalSchema<TEntries$1[TKey], TMessage>;
};
/**
* Schema with required type.
*/
export type SchemaWithRequired<TSchema extends Schema$5, TKeys extends ObjectKeys<TSchema> | undefined, TMessage extends ErrorMessage<NonOptionalIssue> | undefined> = TSchema extends ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: RequiredEntries$1<TEntries, TKeys, TMessage>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<RequiredEntries$1<TEntries, TKeys, TMessage>>, InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>>, NonOptionalIssue | InferIssue<TSchema>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<RequiredEntries$1<TEntries, TKeys, TMessage>>;
		readonly output: InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>>;
		readonly issue: NonOptionalIssue | InferIssue<TSchema>;
	} | undefined;
} : TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: RequiredEntries$1<TEntries, TKeys, TMessage>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
		[key: string]: unknown;
	}, InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
		[key: string]: unknown;
	}, NonOptionalIssue | InferIssue<TSchema>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
			[key: string]: unknown;
		};
		readonly issue: NonOptionalIssue | InferIssue<TSchema>;
	} | undefined;
} : TSchema extends ObjectWithRestSchema<infer TEntries, infer TRest, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: RequiredEntries$1<TEntries, TKeys, TMessage>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
		[key: string]: InferInput<TRest>;
	}, InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
		[key: string]: InferOutput<TRest>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
		[key: string]: InferOutput<TRest>;
	}, NonOptionalIssue | InferIssue<TSchema>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
			[key: string]: InferInput<TRest>;
		};
		readonly output: InferObjectOutput<RequiredEntries$1<TEntries, TKeys, TMessage>> & {
			[key: string]: InferOutput<TRest>;
		};
		readonly issue: NonOptionalIssue | InferIssue<TSchema>;
	} | undefined;
} : never;
declare function required<const TSchema extends Schema$5>(schema: TSchema): SchemaWithRequired<TSchema, undefined, undefined>;
declare function required<const TSchema extends Schema$5, const TMessage extends ErrorMessage<NonOptionalIssue> | undefined>(schema: TSchema, message: TMessage): SchemaWithRequired<TSchema, undefined, TMessage>;
declare function required<const TSchema extends Schema$5, const TKeys extends ObjectKeys<TSchema>>(schema: TSchema, keys: TKeys): SchemaWithRequired<TSchema, TKeys, undefined>;
declare function required<const TSchema extends Schema$5, const TKeys extends ObjectKeys<TSchema>, const TMessage extends ErrorMessage<NonOptionalIssue> | undefined>(schema: TSchema, keys: TKeys, message: TMessage): SchemaWithRequired<TSchema, TKeys, TMessage>;
//#endregion
//#region src/methods/required/requiredAsync.d.ts
/**
* Schema type.
*/
export type Schema$4 = SchemaWithoutPipe<LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>>;
/**
* Required entries type.
*/
export type RequiredEntries<TEntries$1 extends ObjectEntriesAsync, TKeys extends readonly (keyof TEntries$1)[] | undefined, TMessage extends ErrorMessage<NonOptionalIssue> | undefined> = {
	[TKey in keyof TEntries$1]: TKeys extends readonly (keyof TEntries$1)[] ? TKey extends TKeys[number] ? NonOptionalSchemaAsync<TEntries$1[TKey], TMessage> : TEntries$1[TKey] : NonOptionalSchemaAsync<TEntries$1[TKey], TMessage>;
};
/**
* Schema with required type.
*/
export type SchemaWithRequiredAsync<TSchema extends Schema$4, TKeys extends ObjectKeys<TSchema> | undefined, TMessage extends ErrorMessage<NonOptionalIssue> | undefined> = TSchema extends ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>>, InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>, NonOptionalIssue | InferIssue<TSchema>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>>;
		readonly output: InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>;
		readonly issue: NonOptionalIssue | InferIssue<TSchema>;
	} | undefined;
} : TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
		[key: string]: unknown;
	}, InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
		[key: string]: unknown;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
		[key: string]: unknown;
	}, NonOptionalIssue | InferIssue<TSchema>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
			[key: string]: unknown;
		};
		readonly output: InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
			[key: string]: unknown;
		};
		readonly issue: NonOptionalIssue | InferIssue<TSchema>;
	} | undefined;
} : TSchema extends ObjectWithRestSchemaAsync<infer TEntries, infer TRest, ErrorMessage<ObjectWithRestIssue> | undefined> ? Omit<TSchema, "entries" | "~standard" | "~run" | "~types"> & {
	/**
	* The object entries.
	*/
	readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
		[key: string]: InferInput<TRest>;
	}, InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
		[key: string]: InferOutput<TRest>;
	}>;
	/**
	* Parses unknown input.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
		[key: string]: InferOutput<TRest>;
	}, NonOptionalIssue | InferIssue<TSchema>>>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
			[key: string]: InferInput<TRest>;
		};
		readonly output: InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
			[key: string]: InferOutput<TRest>;
		};
		readonly issue: NonOptionalIssue | InferIssue<TSchema>;
	} | undefined;
} : never;
declare function requiredAsync<const TSchema extends Schema$4>(schema: TSchema): SchemaWithRequiredAsync<TSchema, undefined, undefined>;
declare function requiredAsync<const TSchema extends Schema$4, const TMessage extends ErrorMessage<NonOptionalIssue> | undefined>(schema: TSchema, message: TMessage): SchemaWithRequiredAsync<TSchema, undefined, TMessage>;
declare function requiredAsync<const TSchema extends Schema$4, const TKeys extends ObjectKeys<TSchema>>(schema: TSchema, keys: TKeys): SchemaWithRequiredAsync<TSchema, TKeys, undefined>;
declare function requiredAsync<const TSchema extends Schema$4, const TKeys extends ObjectKeys<TSchema>, const TMessage extends ErrorMessage<NonOptionalIssue> | undefined>(schema: TSchema, keys: TKeys, message: TMessage): SchemaWithRequiredAsync<TSchema, TKeys, TMessage>;
//#endregion
//#region src/methods/safeParse/types.d.ts
/**
* Safe parse result type.
*/
export type SafeParseResult<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = {
	/**
	* Whether is's typed.
	*/
	readonly typed: true;
	/**
	* Whether it's successful.
	*/
	readonly success: true;
	/**
	* The output value.
	*/
	readonly output: InferOutput<TSchema>;
	/**
	* The issues, if any.
	*/
	readonly issues: undefined;
} | {
	readonly typed: true;
	readonly success: false;
	readonly output: InferOutput<TSchema>;
	readonly issues: [
		InferIssue<TSchema>,
		...InferIssue<TSchema>[]
	];
} | {
	readonly typed: false;
	readonly success: false;
	readonly output: unknown;
	readonly issues: [
		InferIssue<TSchema>,
		...InferIssue<TSchema>[]
	];
};
declare function safeParse<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, input: unknown, config?: Config<InferIssue<TSchema>>): SafeParseResult<TSchema>;
declare function safeParseAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema, input: unknown, config?: Config<InferIssue<TSchema>>): Promise<SafeParseResult<TSchema>>;
//#endregion
//#region src/methods/safeParser/safeParser.d.ts
/**
* The safe parser interface.
*/
export interface SafeParser<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TConfig extends Config<InferIssue<TSchema>> | undefined> {
	/**
	* Parses an unknown input based on the schema.
	*/
	(input: unknown): SafeParseResult<TSchema>;
	/**
	* The schema to be used.
	*/
	readonly schema: TSchema;
	/**
	* The parser configuration.
	*/
	readonly config: TConfig;
}
declare function safeParser<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): SafeParser<TSchema, undefined>;
declare function safeParser<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TConfig extends Config<InferIssue<TSchema>> | undefined>(schema: TSchema, config: TConfig): SafeParser<TSchema, TConfig>;
//#endregion
//#region src/methods/safeParser/safeParserAsync.d.ts
/**
* The safe parser async interface.
*/
export interface SafeParserAsync<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TConfig extends Config<InferIssue<TSchema>> | undefined> {
	/**
	* Parses an unknown input based on the schema.
	*/
	(input: unknown): Promise<SafeParseResult<TSchema>>;
	/**
	* The schema to be used.
	*/
	readonly schema: TSchema;
	/**
	* The parser configuration.
	*/
	readonly config: TConfig;
}
declare function safeParserAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): SafeParserAsync<TSchema, undefined>;
declare function safeParserAsync<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TConfig extends Config<InferIssue<TSchema>> | undefined>(schema: TSchema, config: TConfig): SafeParserAsync<TSchema, TConfig>;
declare function summarize(issues: [
	BaseIssue<unknown>,
	...BaseIssue<unknown>[]
]): string;
declare function unwrap<TSchema extends ExactOptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | ExactOptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | NonNullableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<NonNullableIssue> | undefined> | NonNullableSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<NonNullableIssue> | undefined> | NonNullishSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<NonNullishIssue> | undefined> | NonNullishSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<NonNullishIssue> | undefined> | NonOptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<NonOptionalIssue> | undefined> | NonOptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<NonOptionalIssue> | undefined> | NullableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | NullableSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | NullishSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | NullishSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | UndefinedableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | UndefinedableSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown>>(schema: TSchema): TSchema["wrapped"];
//#endregion
//#region src/types/metadata.d.ts
/**
* Base metadata interface.
*/
export interface BaseMetadata<TInput$1> {
	/**
	* The object kind.
	*/
	readonly kind: "metadata";
	/**
	* The metadata type.
	*/
	readonly type: string;
	/**
	* The metadata reference.
	*/
	readonly reference: (...args: any[]) => BaseMetadata<any>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: TInput$1;
		readonly output: TInput$1;
		readonly issue: never;
	} | undefined;
}
/**
* Generic metadata type.
*/
export type GenericMetadata<TInput$1 = any> = BaseMetadata<TInput$1>;
//#endregion
//#region src/types/dataset.d.ts
/**
* Unknown dataset interface.
*/
export interface UnknownDataset {
	/**
	* Whether is's typed.
	*/
	typed?: false;
	/**
	* The dataset value.
	*/
	value: unknown;
	/**
	* The dataset issues.
	*/
	issues?: undefined;
}
/**
* Success dataset interface.
*/
export interface SuccessDataset<TValue$1> {
	/**
	* Whether is's typed.
	*/
	typed: true;
	/**
	* The dataset value.
	*/
	value: TValue$1;
	/**
	* The dataset issues.
	*/
	issues?: undefined;
}
/**
* Partial dataset interface.
*/
export interface PartialDataset<TValue$1, TIssue extends BaseIssue<unknown>> {
	/**
	* Whether is's typed.
	*/
	typed: true;
	/**
	* The dataset value.
	*/
	value: TValue$1;
	/**
	* The dataset issues.
	*/
	issues: [
		TIssue,
		...TIssue[]
	];
}
/**
* Failure dataset interface.
*/
export interface FailureDataset<TIssue extends BaseIssue<unknown>> {
	/**
	* Whether is's typed.
	*/
	typed: false;
	/**
	* The dataset value.
	*/
	value: unknown;
	/**
	* The dataset issues.
	*/
	issues: [
		TIssue,
		...TIssue[]
	];
}
/**
* Output dataset type.
*/
export type OutputDataset<TValue$1, TIssue extends BaseIssue<unknown>> = SuccessDataset<TValue$1> | PartialDataset<TValue$1, TIssue> | FailureDataset<TIssue>;
//#endregion
//#region src/types/standard.d.ts
/**
* The Standard Schema properties interface.
*/
export interface StandardProps<TInput$1, TOutput$1> {
	/**
	* The version number of the standard.
	*/
	readonly version: 1;
	/**
	* The vendor name of the schema library.
	*/
	readonly vendor: "valibot";
	/**
	* Validates unknown input values.
	*/
	readonly validate: (value: unknown) => StandardResult<TOutput$1> | Promise<StandardResult<TOutput$1>>;
	/**
	* Inferred types associated with the schema.
	*/
	readonly types?: StandardTypes<TInput$1, TOutput$1> | undefined;
}
/**
* The result interface of the validate function.
*/
export type StandardResult<TOutput$1> = StandardSuccessResult<TOutput$1> | StandardFailureResult;
/**
* The result interface if validation succeeds.
*/
export interface StandardSuccessResult<TOutput$1> {
	/**
	* The typed output value.
	*/
	readonly value: TOutput$1;
	/**
	* The non-existent issues.
	*/
	readonly issues?: undefined;
}
/**
* The result interface if validation fails.
*/
export interface StandardFailureResult {
	/**
	* The issues of failed validation.
	*/
	readonly issues: readonly StandardIssue[];
}
/**
* The issue interface of the failure output.
*/
export interface StandardIssue {
	/**
	* The error message of the issue.
	*/
	readonly message: string;
	/**
	* The path of the issue, if any.
	*/
	readonly path?: readonly (PropertyKey | StandardPathItem)[] | undefined;
}
/**
* The path item interface of the issue.
*/
export interface StandardPathItem {
	/**
	* The key of the path item.
	*/
	readonly key: PropertyKey;
}
/**
* The Standard Schema types interface.
*/
export interface StandardTypes<TInput$1, TOutput$1> {
	/**
	* The input type of the schema.
	*/
	readonly input: TInput$1;
	/**
	* The output type of the schema.
	*/
	readonly output: TOutput$1;
}
//#endregion
//#region src/types/schema.d.ts
/**
* Base schema interface.
*/
export interface BaseSchema<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> {
	/**
	* The object kind.
	*/
	readonly kind: "schema";
	/**
	* The schema type.
	*/
	readonly type: string;
	/**
	* The schema reference.
	*/
	readonly reference: (...args: any[]) => BaseSchema<unknown, unknown, BaseIssue<unknown>>;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* Whether it's async.
	*/
	readonly async: false;
	/**
	* The Standard Schema properties.
	*
	* @internal
	*/
	readonly "~standard": StandardProps<TInput$1, TOutput$1>;
	/**
	* Parses unknown input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => OutputDataset<TOutput$1, TIssue>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: TInput$1;
		readonly output: TOutput$1;
		readonly issue: TIssue;
	} | undefined;
}
/**
* Base schema async interface.
*/
export interface BaseSchemaAsync<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> extends Omit<BaseSchema<TInput$1, TOutput$1, TIssue>, "reference" | "async" | "~run"> {
	/**
	* The schema reference.
	*/
	readonly reference: (...args: any[]) => BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>;
	/**
	* Whether it's async.
	*/
	readonly async: true;
	/**
	* Parses unknown input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: UnknownDataset, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<TOutput$1, TIssue>>;
}
/**
* Generic schema type.
*/
export type GenericSchema<TInput$1 = unknown, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = BaseSchema<TInput$1, TOutput$1, TIssue>;
/**
* Generic schema async type.
*/
export type GenericSchemaAsync<TInput$1 = unknown, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = BaseSchemaAsync<TInput$1, TOutput$1, TIssue>;
//#endregion
//#region src/types/transformation.d.ts
/**
* Base transformation interface.
*/
export interface BaseTransformation<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> {
	/**
	* The object kind.
	*/
	readonly kind: "transformation";
	/**
	* The transformation type.
	*/
	readonly type: string;
	/**
	* The transformation reference.
	*/
	readonly reference: (...args: any[]) => BaseTransformation<any, any, BaseIssue<unknown>>;
	/**
	* Whether it's async.
	*/
	readonly async: false;
	/**
	* Transforms known input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: SuccessDataset<TInput$1>, config: Config<BaseIssue<unknown>>) => OutputDataset<TOutput$1, BaseIssue<unknown> | TIssue>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: TInput$1;
		readonly output: TOutput$1;
		readonly issue: TIssue;
	} | undefined;
}
/**
* Base transformation async interface.
*/
export interface BaseTransformationAsync<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> extends Omit<BaseTransformation<TInput$1, TOutput$1, TIssue>, "reference" | "async" | "~run"> {
	/**
	* The transformation reference.
	*/
	readonly reference: (...args: any[]) => BaseTransformation<any, any, BaseIssue<unknown>> | BaseTransformationAsync<any, any, BaseIssue<unknown>>;
	/**
	* Whether it's async.
	*/
	readonly async: true;
	/**
	* Transforms known input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: SuccessDataset<TInput$1>, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<TOutput$1, BaseIssue<unknown> | TIssue>>;
}
/**
* Generic transformation type.
*/
export type GenericTransformation<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = BaseTransformation<TInput$1, TOutput$1, TIssue>;
/**
* Generic transformation async type.
*/
export type GenericTransformationAsync<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = BaseTransformationAsync<TInput$1, TOutput$1, TIssue>;
//#endregion
//#region src/types/validation.d.ts
/**
* Base validation interface.
*/
export interface BaseValidation<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> {
	/**
	* The object kind.
	*/
	readonly kind: "validation";
	/**
	* The validation type.
	*/
	readonly type: string;
	/**
	* The validation reference.
	*/
	readonly reference: (...args: any[]) => BaseValidation<any, any, BaseIssue<unknown>>;
	/**
	* The expected property.
	*/
	readonly expects: string | null;
	/**
	* Whether it's async.
	*/
	readonly async: false;
	/**
	* Validates known input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: OutputDataset<TInput$1, BaseIssue<unknown>>, config: Config<BaseIssue<unknown>>) => OutputDataset<TOutput$1, BaseIssue<unknown> | TIssue>;
	/**
	* The input, output and issue type.
	*
	* @internal
	*/
	readonly "~types"?: {
		readonly input: TInput$1;
		readonly output: TOutput$1;
		readonly issue: TIssue;
	} | undefined;
}
/**
* Base validation async interface.
*/
export interface BaseValidationAsync<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> extends Omit<BaseValidation<TInput$1, TOutput$1, TIssue>, "reference" | "async" | "~run"> {
	/**
	* The validation reference.
	*/
	readonly reference: (...args: any[]) => BaseValidation<any, any, BaseIssue<unknown>> | BaseValidationAsync<any, any, BaseIssue<unknown>>;
	/**
	* Whether it's async.
	*/
	readonly async: true;
	/**
	* Validates known input values.
	*
	* @param dataset The input dataset.
	* @param config The configuration.
	*
	* @returns The output dataset.
	*
	* @internal
	*/
	readonly "~run": (dataset: OutputDataset<TInput$1, BaseIssue<unknown>>, config: Config<BaseIssue<unknown>>) => Promise<OutputDataset<TOutput$1, BaseIssue<unknown> | TIssue>>;
}
/**
* Generic validation type.
*/
export type GenericValidation<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = BaseValidation<TInput$1, TOutput$1, TIssue>;
/**
* Generic validation async type.
*/
export type GenericValidationAsync<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = BaseValidationAsync<TInput$1, TOutput$1, TIssue>;
//#endregion
//#region src/types/infer.d.ts
/**
* Infer input type.
*/
export type InferInput<TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | BaseValidation<any, unknown, BaseIssue<unknown>> | BaseValidationAsync<any, unknown, BaseIssue<unknown>> | BaseTransformation<any, unknown, BaseIssue<unknown>> | BaseTransformationAsync<any, unknown, BaseIssue<unknown>> | BaseMetadata<any>> = NonNullable<TItem$1["~types"]>["input"];
/**
* Infer output type.
*/
export type InferOutput<TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | BaseValidation<any, unknown, BaseIssue<unknown>> | BaseValidationAsync<any, unknown, BaseIssue<unknown>> | BaseTransformation<any, unknown, BaseIssue<unknown>> | BaseTransformationAsync<any, unknown, BaseIssue<unknown>> | BaseMetadata<any>> = NonNullable<TItem$1["~types"]>["output"];
/**
* Infer issue type.
*/
export type InferIssue<TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | BaseValidation<any, unknown, BaseIssue<unknown>> | BaseValidationAsync<any, unknown, BaseIssue<unknown>> | BaseTransformation<any, unknown, BaseIssue<unknown>> | BaseTransformationAsync<any, unknown, BaseIssue<unknown>> | BaseMetadata<any>> = NonNullable<TItem$1["~types"]>["issue"];
//#endregion
//#region src/types/utils.d.ts
/**
* Checks if a type is `any`.
*/
export type IsAny<Type> = 0 extends 1 & Type ? true : false;
/**
* Checks if a type is `never`.
*/
export type IsNever<Type> = [
	Type
] extends [
	never
] ? true : false;
/**
* Extracts `null` from a type.
*/
export type NonNullable$1<TValue$1> = TValue$1 extends null ? never : TValue$1;
/**
* Extracts `null` and `undefined` from a type.
*/
export type NonNullish<TValue$1> = TValue$1 extends null | undefined ? never : TValue$1;
/**
* Extracts `undefined` from a type.
*/
export type NonOptional<TValue$1> = TValue$1 extends undefined ? never : TValue$1;
/**
* Constructs a type that is maybe readonly.
*/
export type MaybeReadonly<TValue$1> = TValue$1 | Readonly<TValue$1>;
/**
* Constructs a type that is deeply readonly.
*/
export type DeepReadonly<TValue$1> = TValue$1 extends Record<string, unknown> | readonly unknown[] ? {
	readonly [TKey in keyof TValue$1]: DeepReadonly<TValue$1[TKey]>;
} : TValue$1;
/**
* Constructs a type that is maybe deeply readonly.
*/
export type MaybeDeepReadonly<TValue$1> = TValue$1 | DeepReadonly<TValue$1>;
/**
* Constructs a type that is maybe a promise.
*/
export type MaybePromise<TValue$1> = TValue$1 | Promise<TValue$1>;
/**
* Prettifies a type for better readability.
*
* Hint: This type has no effect and is only used so that TypeScript displays
* the final type in the preview instead of the utility types used.
*/
export type Prettify<TObject> = {
	[TKey in keyof TObject]: TObject[TKey];
} & {};
/**
* Marks specific keys as optional.
*/
export type MarkOptional<TObject, TKeys extends keyof TObject> = {
	[TKey in keyof TObject]?: unknown;
} & Omit<TObject, TKeys> & Partial<Pick<TObject, TKeys>>;
/**
* Merges two objects. Overlapping entries from the second object overwrite
* properties from the first object.
*/
export type Merge<TFirstObject, TSecondObject> = Omit<TFirstObject, keyof TFirstObject & keyof TSecondObject> & TSecondObject;
/**
* Extracts first tuple item.
*/
export type FirstTupleItem<TTuple extends readonly [
	unknown,
	...unknown[]
]> = TTuple[0];
/**
* Extracts last tuple item.
*/
export type LastTupleItem<TTuple extends readonly [
	unknown,
	...unknown[]
]> = TTuple[TTuple extends readonly [
	unknown,
	...infer TRest
] ? TRest["length"] : never];
/**
* Converts union to intersection type.
*/
export type UnionToIntersect<TUnion> = (TUnion extends any ? (arg: TUnion) => void : never) extends ((arg: infer Intersect) => void) ? Intersect : never;
/**
* Converts union to tuple type using an accumulator.
*
* For more information: {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types}
*/
export type UnionToTupleHelper<TUnion, TResult extends unknown[]> = UnionToIntersect<TUnion extends never ? never : () => TUnion> extends (() => infer TLast) ? UnionToTupleHelper<Exclude<TUnion, TLast>, [
	TLast,
	...TResult
]> : TResult;
/**
* Converts union to tuple type.
*/
export type UnionToTuple<TUnion> = UnionToTupleHelper<TUnion, [
]>;
//#endregion
//#region src/types/other.d.ts
/**
* Error message type.
*/
export type ErrorMessage<TIssue extends BaseIssue<unknown>> = ((issue: TIssue) => string) | string;
/**
* Default type.
*/
export type Default<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TInput$1 extends null | undefined> = MaybeDeepReadonly<InferInput<TWrapped$1> | TInput$1> | ((dataset?: UnknownDataset, config?: Config<InferIssue<TWrapped$1>>) => MaybeDeepReadonly<InferInput<TWrapped$1> | TInput$1>) | undefined;
/**
* Default async type.
*/
export type DefaultAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TInput$1 extends null | undefined> = MaybeDeepReadonly<InferInput<TWrapped$1> | TInput$1> | ((dataset?: UnknownDataset, config?: Config<InferIssue<TWrapped$1>>) => MaybePromise<MaybeDeepReadonly<InferInput<TWrapped$1> | TInput$1>>) | undefined;
/**
* Default value type.
*/
export type DefaultValue<TDefault extends Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, null | undefined> | DefaultAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, null | undefined>> = TDefault extends DefaultAsync<infer TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, infer TInput> ? TDefault extends ((dataset?: UnknownDataset, config?: Config<InferIssue<TWrapped>>) => MaybePromise<MaybeDeepReadonly<InferInput<TWrapped> | TInput>>) ? Awaited<ReturnType<TDefault>> : TDefault : never;
//#endregion
//#region src/types/object.d.ts
/**
* Optional entry schema type.
*/
export type OptionalEntrySchema = ExactOptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | NullishSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>;
/**
* Optional entry schema async type.
*/
export type OptionalEntrySchemaAsync = ExactOptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | NullishSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown>;
/**
* Object entries interface.
*/
export interface ObjectEntries {
	[key: string]: BaseSchema<unknown, unknown, BaseIssue<unknown>> | SchemaWithFallback<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalEntrySchema;
}
/**
* Object entries async interface.
*/
export interface ObjectEntriesAsync {
	[key: string]: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | SchemaWithFallback<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> | SchemaWithFallbackAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, unknown> | OptionalEntrySchema | OptionalEntrySchemaAsync;
}
/**
* Object keys type.
*/
export type ObjectKeys<TSchema extends LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>> = MaybeReadonly<[
	keyof TSchema["entries"],
	...(keyof TSchema["entries"])[]
]>;
/**
* Infer entries input type.
*/
export type InferEntriesInput<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = {
	-readonly [TKey in keyof TEntries$1]: InferInput<TEntries$1[TKey]>;
};
/**
* Infer entries output type.
*/
export type InferEntriesOutput<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = {
	-readonly [TKey in keyof TEntries$1]: InferOutput<TEntries$1[TKey]>;
};
/**
* Optional input keys type.
*/
export type OptionalInputKeys<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries$1]: TEntries$1[TKey] extends OptionalEntrySchema | OptionalEntrySchemaAsync ? TKey : never;
}[keyof TEntries$1];
/**
* Optional output keys type.
*/
export type OptionalOutputKeys<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries$1]: TEntries$1[TKey] extends OptionalEntrySchema | OptionalEntrySchemaAsync ? undefined extends TEntries$1[TKey]["default"] ? TKey : never : never;
}[keyof TEntries$1];
/**
* Input with question marks type.
*/
export type InputWithQuestionMarks<TEntries$1 extends ObjectEntries | ObjectEntriesAsync, TObject extends InferEntriesInput<TEntries$1>> = MarkOptional<TObject, OptionalInputKeys<TEntries$1>>;
/**
* Output with question marks type.
*/
export type OutputWithQuestionMarks<TEntries$1 extends ObjectEntries | ObjectEntriesAsync, TObject extends InferEntriesOutput<TEntries$1>> = MarkOptional<TObject, OptionalOutputKeys<TEntries$1>>;
/**
* Readonly output keys type.
*/
export type ReadonlyOutputKeys<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries$1]: TEntries$1[TKey] extends {
		readonly pipe: readonly unknown[];
	} ? ReadonlyAction<any> extends TEntries$1[TKey]["pipe"][number] ? TKey : never : never;
}[keyof TEntries$1];
/**
* Output with readonly type.
*/
export type OutputWithReadonly<TEntries$1 extends ObjectEntries | ObjectEntriesAsync, TObject extends OutputWithQuestionMarks<TEntries$1, InferEntriesOutput<TEntries$1>>> = ReadonlyOutputKeys<TEntries$1> extends never ? TObject : Readonly<TObject> & Pick<TObject, Exclude<keyof TObject, ReadonlyOutputKeys<TEntries$1>>>;
/**
* Infer object input type.
*/
export type InferObjectInput<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = Prettify<InputWithQuestionMarks<TEntries$1, InferEntriesInput<TEntries$1>>>;
/**
* Infer object output type.
*/
export type InferObjectOutput<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = Prettify<OutputWithReadonly<TEntries$1, OutputWithQuestionMarks<TEntries$1, InferEntriesOutput<TEntries$1>>>>;
/**
* Infer object issue type.
*/
export type InferObjectIssue<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = InferIssue<TEntries$1[keyof TEntries$1]>;
//#endregion
//#region src/types/tuple.d.ts
/**
* Tuple items type.
*/
export type TupleItems = MaybeReadonly<BaseSchema<unknown, unknown, BaseIssue<unknown>>[]>;
/**
* Tuple items async type.
*/
export type TupleItemsAsync = MaybeReadonly<(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)[]>;
/**
* Infer tuple input type.
*/
export type InferTupleInput<TItems$1 extends TupleItems | TupleItemsAsync> = {
	-readonly [TKey in keyof TItems$1]: InferInput<TItems$1[TKey]>;
};
/**
* Infer tuple output type.
*/
export type InferTupleOutput<TItems$1 extends TupleItems | TupleItemsAsync> = {
	-readonly [TKey in keyof TItems$1]: InferOutput<TItems$1[TKey]>;
};
/**
* Infer tuple issue type.
*/
export type InferTupleIssue<TItems$1 extends TupleItems | TupleItemsAsync> = InferIssue<TItems$1[number]>;
//#endregion
//#region src/types/issue.d.ts
/**
* Array path item interface.
*/
export interface ArrayPathItem {
	/**
	* The path item type.
	*/
	readonly type: "array";
	/**
	* The path item origin.
	*/
	readonly origin: "value";
	/**
	* The path item input.
	*/
	readonly input: MaybeReadonly<unknown[]>;
	/**
	* The path item key.
	*/
	readonly key: number;
	/**
	* The path item value.
	*/
	readonly value: unknown;
}
/**
* Map path item interface.
*/
export interface MapPathItem {
	/**
	* The path item type.
	*/
	readonly type: "map";
	/**
	* The path item origin.
	*/
	readonly origin: "key" | "value";
	/**
	* The path item input.
	*/
	readonly input: Map<unknown, unknown>;
	/**
	* The path item key.
	*/
	readonly key: unknown;
	/**
	* The path item value.
	*/
	readonly value: unknown;
}
/**
* Object path item interface.
*/
export interface ObjectPathItem {
	/**
	* The path item type.
	*/
	readonly type: "object";
	/**
	* The path item origin.
	*/
	readonly origin: "key" | "value";
	/**
	* The path item input.
	*/
	readonly input: Record<string, unknown>;
	/**
	* The path item key.
	*/
	readonly key: string;
	/**
	* The path item value.
	*/
	readonly value: unknown;
}
/**
* Set path item interface.
*/
export interface SetPathItem {
	/**
	* The path item type.
	*/
	readonly type: "set";
	/**
	* The path item origin.
	*/
	readonly origin: "value";
	/**
	* The path item input.
	*/
	readonly input: Set<unknown>;
	/**
	* The path item key.
	*/
	readonly key: null;
	/**
	* The path item key.
	*/
	readonly value: unknown;
}
/**
* Unknown path item interface.
*/
export interface UnknownPathItem {
	/**
	* The path item type.
	*/
	readonly type: "unknown";
	/**
	* The path item origin.
	*/
	readonly origin: "key" | "value";
	/**
	* The path item input.
	*/
	readonly input: unknown;
	/**
	* The path item key.
	*/
	readonly key: unknown;
	/**
	* The path item value.
	*/
	readonly value: unknown;
}
/**
* Issue path item type.
*/
export type IssuePathItem = ArrayPathItem | MapPathItem | ObjectPathItem | SetPathItem | UnknownPathItem;
/**
* Base issue interface.
*/
export interface BaseIssue<TInput$1> extends Config<BaseIssue<TInput$1>> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema" | "validation" | "transformation";
	/**
	* The issue type.
	*/
	readonly type: string;
	/**
	* The raw input data.
	*/
	readonly input: TInput$1;
	/**
	* The expected property.
	*/
	readonly expected: string | null;
	/**
	* The received property.
	*/
	readonly received: string;
	/**
	* The error message.
	*/
	readonly message: string;
	/**
	* The input requirement.
	*/
	readonly requirement?: unknown | undefined;
	/**
	* The issue path.
	*/
	readonly path?: [
		IssuePathItem,
		...IssuePathItem[]
	] | undefined;
	/**
	* The sub issues.
	*/
	readonly issues?: [
		BaseIssue<TInput$1>,
		...BaseIssue<TInput$1>[]
	] | undefined;
}
/**
* Generic issue type.
*/
export type GenericIssue<TInput$1 = unknown> = BaseIssue<TInput$1>;
/**
* Dot path type.
*/
export type DotPath<TKey$1 extends string | number | symbol, TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TKey$1 extends string | number ? `${TKey$1}` | `${TKey$1}.${IssueDotPath<TSchema>}` : never;
/**
* Object path type.
*/
export type ObjectPath<TEntries$1 extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries$1]: DotPath<TKey, TEntries$1[TKey]>;
}[keyof TEntries$1];
/**
* Tuple keys type.
*/
export type TupleKeys<TItems$1 extends TupleItems | TupleItemsAsync> = Exclude<keyof TItems$1, keyof [
]>;
/**
* Tuple path type.
*/
export type TuplePath<TItems$1 extends TupleItems | TupleItemsAsync> = {
	[TKey in TupleKeys<TItems$1>]: TItems$1[TKey] extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> ? DotPath<TKey, TItems$1[TKey]> : never;
}[TupleKeys<TItems$1>];
/**
* Issue dot path type.
*/
export type IssueDotPath<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TSchema extends SchemaWithPipe<infer TPipe> ? IssueDotPath<FirstTupleItem<TPipe>> : TSchema extends SchemaWithPipeAsync<infer TPipe> ? IssueDotPath<FirstTupleItem<TPipe>> : TSchema extends ArraySchema<infer TItem, ErrorMessage<ArrayIssue> | undefined> ? DotPath<number, TItem> : TSchema extends ArraySchemaAsync<infer TItem, ErrorMessage<ArrayIssue> | undefined> ? DotPath<number, TItem> : TSchema extends IntersectSchema<infer TOptions, ErrorMessage<IntersectIssue> | undefined> | UnionSchema<infer TOptions, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> | VariantSchema<string, infer TOptions, ErrorMessage<VariantIssue> | undefined> ? IssueDotPath<TOptions[number]> : TSchema extends IntersectSchemaAsync<infer TOptions, ErrorMessage<IntersectIssue> | undefined> | UnionSchemaAsync<infer TOptions, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> | VariantSchemaAsync<string, infer TOptions, ErrorMessage<VariantIssue> | undefined> ? IssueDotPath<TOptions[number]> : TSchema extends MapSchema<infer TKey, infer TValue, ErrorMessage<MapIssue> | undefined> | RecordSchema<infer TKey, infer TValue, ErrorMessage<RecordIssue> | undefined> ? DotPath<InferInput<TKey>, TValue> : TSchema extends MapSchemaAsync<infer TKey, infer TValue, ErrorMessage<MapIssue> | undefined> | RecordSchemaAsync<infer TKey, infer TValue, ErrorMessage<RecordIssue> | undefined> ? DotPath<InferInput<TKey>, TValue> : TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? ObjectPath<TEntries> : TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined> | StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined> ? ObjectPath<TEntries> : TSchema extends ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> ? string : TSchema extends ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> ? string : TSchema extends SetSchema<infer TValue, ErrorMessage<SetIssue> | undefined> ? DotPath<number, TValue> : TSchema extends SetSchemaAsync<infer TValue, ErrorMessage<SetIssue> | undefined> ? DotPath<number, TValue> : TSchema extends LooseTupleSchema<infer TItems, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchema<infer TItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<infer TItems, ErrorMessage<TupleIssue> | undefined> ? TuplePath<TItems> : TSchema extends LooseTupleSchemaAsync<infer TItems, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchemaAsync<infer TItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchemaAsync<infer TItems, ErrorMessage<TupleIssue> | undefined> ? TuplePath<TItems> : TSchema extends TupleWithRestSchema<infer TItems, infer TRest, ErrorMessage<TupleWithRestIssue> | undefined> ? TuplePath<TItems> | DotPath<number, TRest> : TSchema extends TupleWithRestSchemaAsync<infer TItems, infer TRest, ErrorMessage<TupleWithRestIssue> | undefined> ? TuplePath<TItems> | DotPath<number, TRest> : TSchema extends ExactOptionalSchema<infer TWrapped, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, never>> | LazySchema<infer TWrapped> | NonNullableSchema<infer TWrapped, ErrorMessage<NonNullableIssue> | undefined> | NonNullishSchema<infer TWrapped, ErrorMessage<NonNullishIssue> | undefined> | NonOptionalSchema<infer TWrapped, ErrorMessage<NonOptionalIssue> | undefined> | NullableSchema<infer TWrapped, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, null>> | NullishSchema<infer TWrapped, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, null | undefined>> | OptionalSchema<infer TWrapped, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>> | UndefinedableSchema<infer TWrapped, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>> ? IssueDotPath<TWrapped> : TSchema extends ExactOptionalSchemaAsync<infer TWrapped, DefaultAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, never>> | LazySchemaAsync<infer TWrapped> | NonNullableSchemaAsync<infer TWrapped, ErrorMessage<NonNullableIssue> | undefined> | NonNullishSchemaAsync<infer TWrapped, ErrorMessage<NonNullishIssue> | undefined> | NonOptionalSchemaAsync<infer TWrapped, ErrorMessage<NonOptionalIssue> | undefined> | NullableSchemaAsync<infer TWrapped, DefaultAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, null>> | NullishSchemaAsync<infer TWrapped, DefaultAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, null | undefined>> | OptionalSchemaAsync<infer TWrapped, DefaultAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, undefined>> | UndefinedableSchemaAsync<infer TWrapped, DefaultAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, undefined>> ? IssueDotPath<TWrapped> : never;
//#endregion
//#region src/types/config.d.ts
/**
* Config interface.
*/
export interface Config<TIssue extends BaseIssue<unknown>> {
	/**
	* The selected language.
	*/
	readonly lang?: string | undefined;
	/**
	* The error message.
	*/
	readonly message?: ErrorMessage<TIssue> | undefined;
	/**
	* Whether it should be aborted early.
	*/
	readonly abortEarly?: boolean | undefined;
	/**
	* Whether a pipe should be aborted early.
	*/
	readonly abortPipeEarly?: boolean | undefined;
}
//#endregion
//#region src/types/pipe.d.ts
/**
* Pipe action type.
*/
export type PipeAction<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> = BaseValidation<TInput$1, TOutput$1, TIssue> | BaseTransformation<TInput$1, TOutput$1, TIssue> | BaseMetadata<TInput$1>;
/**
* Pipe action async type.
*/
export type PipeActionAsync<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> = BaseValidationAsync<TInput$1, TOutput$1, TIssue> | BaseTransformationAsync<TInput$1, TOutput$1, TIssue>;
/**
* Pipe item type.
*/
export type PipeItem<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> = BaseSchema<TInput$1, TOutput$1, TIssue> | PipeAction<TInput$1, TOutput$1, TIssue>;
/**
* Pipe item async type.
*/
export type PipeItemAsync<TInput$1, TOutput$1, TIssue extends BaseIssue<unknown>> = BaseSchemaAsync<TInput$1, TOutput$1, TIssue> | PipeActionAsync<TInput$1, TOutput$1, TIssue>;
/**
* Schema without pipe type.
*/
export type SchemaWithoutPipe<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TSchema & {
	pipe?: never;
};
/**
* Generic pipe action type.
*/
export type GenericPipeAction<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = PipeAction<TInput$1, TOutput$1, TIssue>;
/**
* Generic pipe action async type.
*/
export type GenericPipeActionAsync<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = PipeActionAsync<TInput$1, TOutput$1, TIssue>;
/**
* Generic pipe item type.
*/
export type GenericPipeItem<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = PipeItem<TInput$1, TOutput$1, TIssue>;
/**
* Generic pipe item async type.
*/
export type GenericPipeItemAsync<TInput$1 = any, TOutput$1 = TInput$1, TIssue extends BaseIssue<unknown> = BaseIssue<unknown>> = PipeItemAsync<TInput$1, TOutput$1, TIssue>;
//#endregion
//#region src/schemas/any/any.d.ts
/**
* Any schema interface.
*/
export interface AnySchema extends BaseSchema<any, any, never> {
	/**
	* The schema type.
	*/
	readonly type: "any";
	/**
	* The schema reference.
	*/
	readonly reference: typeof any;
	/**
	* The expected property.
	*/
	readonly expects: "any";
}
declare function any(): AnySchema;
//#endregion
//#region src/schemas/array/types.d.ts
/**
* Array issue interface.
*/
export interface ArrayIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "array";
	/**
	* The expected property.
	*/
	readonly expected: "Array";
}
//#endregion
//#region src/schemas/array/array.d.ts
/**
* Array schema interface.
*/
export interface ArraySchema<TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<ArrayIssue> | undefined> extends BaseSchema<InferInput<TItem$1>[], InferOutput<TItem$1>[], ArrayIssue | InferIssue<TItem$1>> {
	/**
	* The schema type.
	*/
	readonly type: "array";
	/**
	* The schema reference.
	*/
	readonly reference: typeof array;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The array item schema.
	*/
	readonly item: TItem$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function array<const TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(item: TItem$1): ArraySchema<TItem$1, undefined>;
declare function array<const TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<ArrayIssue> | undefined>(item: TItem$1, message: TMessage): ArraySchema<TItem$1, TMessage>;
//#endregion
//#region src/schemas/array/arrayAsync.d.ts
/**
* Array schema interface.
*/
export interface ArraySchemaAsync<TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<ArrayIssue> | undefined> extends BaseSchemaAsync<InferInput<TItem$1>[], InferOutput<TItem$1>[], ArrayIssue | InferIssue<TItem$1>> {
	/**
	* The schema type.
	*/
	readonly type: "array";
	/**
	* The schema reference.
	*/
	readonly reference: typeof array | typeof arrayAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The array item schema.
	*/
	readonly item: TItem$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function arrayAsync<const TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(item: TItem$1): ArraySchemaAsync<TItem$1, undefined>;
declare function arrayAsync<const TItem$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<ArrayIssue> | undefined>(item: TItem$1, message: TMessage): ArraySchemaAsync<TItem$1, TMessage>;
//#endregion
//#region src/schemas/bigint/bigint.d.ts
/**
* Bigint issue interface.
*/
export interface BigintIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "bigint";
	/**
	* The expected property.
	*/
	readonly expected: "bigint";
}
/**
* Bigint schema interface.
*/
export interface BigintSchema<TMessage extends ErrorMessage<BigintIssue> | undefined> extends BaseSchema<bigint, bigint, BigintIssue> {
	/**
	* The schema type.
	*/
	readonly type: "bigint";
	/**
	* The schema reference.
	*/
	readonly reference: typeof bigint;
	/**
	* The expected property.
	*/
	readonly expects: "bigint";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function bigint(): BigintSchema<undefined>;
declare function bigint<const TMessage extends ErrorMessage<BigintIssue> | undefined>(message: TMessage): BigintSchema<TMessage>;
//#endregion
//#region src/schemas/blob/blob.d.ts
/**
* Blob issue interface.
*/
export interface BlobIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "blob";
	/**
	* The expected property.
	*/
	readonly expected: "Blob";
}
/**
* Blob schema interface.
*/
export interface BlobSchema<TMessage extends ErrorMessage<BlobIssue> | undefined> extends BaseSchema<Blob, Blob, BlobIssue> {
	/**
	* The schema type.
	*/
	readonly type: "blob";
	/**
	* The schema reference.
	*/
	readonly reference: typeof blob;
	/**
	* The expected property.
	*/
	readonly expects: "Blob";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function blob(): BlobSchema<undefined>;
declare function blob<const TMessage extends ErrorMessage<BlobIssue> | undefined>(message: TMessage): BlobSchema<TMessage>;
//#endregion
//#region src/schemas/boolean/boolean.d.ts
/**
* Boolean issue interface.
*/
export interface BooleanIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "boolean";
	/**
	* The expected property.
	*/
	readonly expected: "boolean";
}
/**
* Boolean schema interface.
*/
export interface BooleanSchema<TMessage extends ErrorMessage<BooleanIssue> | undefined> extends BaseSchema<boolean, boolean, BooleanIssue> {
	/**
	* The schema type.
	*/
	readonly type: "boolean";
	/**
	* The schema reference.
	*/
	readonly reference: typeof boolean;
	/**
	* The expected property.
	*/
	readonly expects: "boolean";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function boolean(): BooleanSchema<undefined>;
declare function boolean<const TMessage extends ErrorMessage<BooleanIssue> | undefined>(message: TMessage): BooleanSchema<TMessage>;
//#endregion
//#region src/schemas/custom/types.d.ts
/**
* Custom issue interface.
*/
export interface CustomIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "custom";
	/**
	* The expected property.
	*/
	readonly expected: "unknown";
}
//#endregion
//#region src/schemas/custom/custom.d.ts
/**
* Check type.
*/
export type Check = (input: unknown) => boolean;
/**
* Custom schema interface.
*/
export interface CustomSchema<TInput$1, TMessage extends ErrorMessage<CustomIssue> | undefined> extends BaseSchema<TInput$1, TInput$1, CustomIssue> {
	/**
	* The schema type.
	*/
	readonly type: "custom";
	/**
	* The schema reference.
	*/
	readonly reference: typeof custom;
	/**
	* The expected property.
	*/
	readonly expects: "unknown";
	/**
	* The type check function.
	*/
	readonly check: Check;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function custom<TInput$1>(check: Check): CustomSchema<TInput$1, undefined>;
declare function custom<TInput$1, const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined>(check: Check, message: TMessage): CustomSchema<TInput$1, TMessage>;
//#endregion
//#region src/schemas/custom/customAsync.d.ts
/**
* Check async type.
*/
export type CheckAsync = (input: unknown) => MaybePromise<boolean>;
/**
* Custom schema async interface.
*/
export interface CustomSchemaAsync<TInput$1, TMessage extends ErrorMessage<CustomIssue> | undefined> extends BaseSchemaAsync<TInput$1, TInput$1, CustomIssue> {
	/**
	* The schema type.
	*/
	readonly type: "custom";
	/**
	* The schema reference.
	*/
	readonly reference: typeof custom | typeof customAsync;
	/**
	* The expected property.
	*/
	readonly expects: "unknown";
	/**
	* The type check function.
	*/
	readonly check: CheckAsync;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function customAsync<TInput$1>(check: CheckAsync): CustomSchemaAsync<TInput$1, undefined>;
declare function customAsync<TInput$1, const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined>(check: CheckAsync, message: TMessage): CustomSchemaAsync<TInput$1, TMessage>;
//#endregion
//#region src/schemas/date/date.d.ts
/**
* Date issue interface.
*/
export interface DateIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "date";
	/**
	* The expected property.
	*/
	readonly expected: "Date";
}
/**
* Date schema interface.
*/
export interface DateSchema<TMessage extends ErrorMessage<DateIssue> | undefined> extends BaseSchema<Date, Date, DateIssue> {
	/**
	* The schema type.
	*/
	readonly type: "date";
	/**
	* The schema reference.
	*/
	readonly reference: typeof date;
	/**
	* The expected property.
	*/
	readonly expects: "Date";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function date(): DateSchema<undefined>;
declare function date<const TMessage extends ErrorMessage<DateIssue> | undefined>(message: TMessage): DateSchema<TMessage>;
//#endregion
//#region src/schemas/enum/enum.d.ts
/**
* Enum interface.
*/
export interface Enum {
	[key: string]: string | number;
}
/**
* Enum values type.
*/
export type EnumValues<TEnum extends Enum> = {
	[TKey in keyof TEnum]: TKey extends number ? TEnum[TKey] extends string ? TEnum[TEnum[TKey]] extends TKey ? never : TEnum[TKey] : TEnum[TKey] : TKey extends "NaN" | "Infinity" | "-Infinity" ? TEnum[TKey] extends string ? TEnum[TEnum[TKey]] extends number ? never : TEnum[TKey] : TEnum[TKey] : TKey extends `+${number}` ? TEnum[TKey] : TKey extends `${infer TNumber extends number}` ? TEnum[TKey] extends string ? TEnum[TEnum[TKey]] extends TNumber ? never : TEnum[TKey] : TEnum[TKey] : TEnum[TKey];
}[keyof TEnum];
/**
* Enum issue interface.
*/
export interface EnumIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "enum";
	/**
	* The expected property.
	*/
	readonly expected: string;
}
/**
* Enum schema interface.
*/
export interface EnumSchema<TEnum extends Enum, TMessage extends ErrorMessage<EnumIssue> | undefined> extends BaseSchema<EnumValues<TEnum>, EnumValues<TEnum>, EnumIssue> {
	/**
	* The schema type.
	*/
	readonly type: "enum";
	/**
	* The schema reference.
	*/
	readonly reference: typeof enum_;
	/**
	* The enum object.
	*/
	readonly enum: TEnum;
	/**
	* The enum options.
	*/
	readonly options: EnumValues<TEnum>[];
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function enum_<const TEnum extends Enum>(enum__: TEnum): EnumSchema<TEnum, undefined>;
declare function enum_<const TEnum extends Enum, const TMessage extends ErrorMessage<EnumIssue> | undefined>(enum__: TEnum, message: TMessage): EnumSchema<TEnum, TMessage>;
//#endregion
//#region src/schemas/exactOptional/exactOptional.d.ts
/**
* Exact optional schema interface.
*/
export interface ExactOptionalSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TDefault extends Default<TWrapped$1, never>> extends BaseSchema<InferInput<TWrapped$1>, InferOutput<TWrapped$1>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "exact_optional";
	/**
	* The schema reference.
	*/
	readonly reference: typeof exactOptional;
	/**
	* The expected property.
	*/
	readonly expects: TWrapped$1["expects"];
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function exactOptional<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): ExactOptionalSchema<TWrapped$1, undefined>;
declare function exactOptional<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TDefault extends Default<TWrapped$1, never>>(wrapped: TWrapped$1, default_: TDefault): ExactOptionalSchema<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/exactOptional/exactOptionalAsync.d.ts
/**
* Exact optional schema async interface.
*/
export interface ExactOptionalSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, never>> extends BaseSchemaAsync<InferInput<TWrapped$1>, InferOutput<TWrapped$1>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "exact_optional";
	/**
	* The schema reference.
	*/
	readonly reference: typeof exactOptional | typeof exactOptionalAsync;
	/**
	* The expected property.
	*/
	readonly expects: TWrapped$1["expects"];
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function exactOptionalAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): ExactOptionalSchemaAsync<TWrapped$1, undefined>;
declare function exactOptionalAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TDefault extends DefaultAsync<TWrapped$1, never>>(wrapped: TWrapped$1, default_: TDefault): ExactOptionalSchemaAsync<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/file/file.d.ts
/**
* File issue interface.
*/
export interface FileIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "file";
	/**
	* The expected property.
	*/
	readonly expected: "File";
}
/**
* File schema interface.
*/
export interface FileSchema<TMessage extends ErrorMessage<FileIssue> | undefined> extends BaseSchema<File, File, FileIssue> {
	/**
	* The schema type.
	*/
	readonly type: "file";
	/**
	* The schema reference.
	*/
	readonly reference: typeof file;
	/**
	* The expected property.
	*/
	readonly expects: "File";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function file(): FileSchema<undefined>;
declare function file<const TMessage extends ErrorMessage<FileIssue> | undefined>(message: TMessage): FileSchema<TMessage>;
//#endregion
//#region src/schemas/function/function.d.ts
/**
* Function issue interface.
*/
export interface FunctionIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "function";
	/**
	* The expected property.
	*/
	readonly expected: "Function";
}
/**
* Function schema interface.
*/
export interface FunctionSchema<TMessage extends ErrorMessage<FunctionIssue> | undefined> extends BaseSchema<(...args: unknown[]) => unknown, (...args: unknown[]) => unknown, FunctionIssue> {
	/**
	* The schema type.
	*/
	readonly type: "function";
	/**
	* The schema reference.
	*/
	readonly reference: typeof function_;
	/**
	* The expected property.
	*/
	readonly expects: "Function";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function function_(): FunctionSchema<undefined>;
declare function function_<const TMessage extends ErrorMessage<FunctionIssue> | undefined>(message: TMessage): FunctionSchema<TMessage>;
//#endregion
//#region src/schemas/instance/instance.d.ts
/**
* Class type.
*/
export type Class = new (...args: any[]) => any;
/**
* Instance issue interface.
*/
export interface InstanceIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "instance";
	/**
	* The expected property.
	*/
	readonly expected: string;
}
/**
* Instance schema interface.
*/
export interface InstanceSchema<TClass extends Class, TMessage extends ErrorMessage<InstanceIssue> | undefined> extends BaseSchema<InstanceType<TClass>, InstanceType<TClass>, InstanceIssue> {
	/**
	* The schema type.
	*/
	readonly type: "instance";
	/**
	* The schema reference.
	*/
	readonly reference: typeof instance;
	/**
	* The class of the instance.
	*/
	readonly class: TClass;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function instance<TClass extends Class>(class_: TClass): InstanceSchema<TClass, undefined>;
declare function instance<TClass extends Class, const TMessage extends ErrorMessage<InstanceIssue> | undefined>(class_: TClass, message: TMessage): InstanceSchema<TClass, TMessage>;
//#endregion
//#region src/schemas/intersect/types.d.ts
/**
* Intersect issue interface.
*/
export interface IntersectIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "intersect";
	/**
	* The expected property.
	*/
	readonly expected: string;
}
/**
* Intersect options type.
*/
export type IntersectOptions = MaybeReadonly<BaseSchema<unknown, unknown, BaseIssue<unknown>>[]>;
/**
* Intersect options async type.
*/
export type IntersectOptionsAsync = MaybeReadonly<(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)[]>;
/**
* Infer option type.
*/
export type InferOption<TInput$1, TOutput$1> = BaseSchema<TInput$1, TOutput$1, BaseIssue<unknown>> | BaseSchemaAsync<TInput$1, TOutput$1, BaseIssue<unknown>>;
/**
* Infer intersect input type.
*/
export type InferIntersectInput<TOptions$1 extends IntersectOptions | IntersectOptionsAsync> = TOptions$1 extends readonly [
	InferOption<infer TInput, unknown>,
	...infer TRest
] ? TRest extends readonly [
	InferOption<unknown, unknown>,
	...InferOption<unknown, unknown>[]
] ? TInput & InferIntersectInput<TRest> : TInput : IsNever<TOptions$1[number]> extends true ? never : UnionToIntersect<InferInput<TOptions$1[number]>>;
/**
* Infer intersect output type.
*/
export type InferIntersectOutput<TOptions$1 extends IntersectOptions | IntersectOptionsAsync> = TOptions$1 extends readonly [
	InferOption<unknown, infer TOutput>,
	...infer TRest
] ? TRest extends readonly [
	InferOption<unknown, unknown>,
	...InferOption<unknown, unknown>[]
] ? TOutput & InferIntersectOutput<TRest> : TOutput : IsNever<TOptions$1[number]> extends true ? never : UnionToIntersect<InferOutput<TOptions$1[number]>>;
//#endregion
//#region src/schemas/intersect/intersect.d.ts
/**
* Intersect schema interface.
*/
export interface IntersectSchema<TOptions$1 extends IntersectOptions, TMessage extends ErrorMessage<IntersectIssue> | undefined> extends BaseSchema<InferIntersectInput<TOptions$1>, InferIntersectOutput<TOptions$1>, IntersectIssue | InferIssue<TOptions$1[number]>> {
	/**
	* The schema type.
	*/
	readonly type: "intersect";
	/**
	* The schema reference.
	*/
	readonly reference: typeof intersect;
	/**
	* The intersect options.
	*/
	readonly options: TOptions$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function intersect<const TOptions$1 extends IntersectOptions>(options: TOptions$1): IntersectSchema<TOptions$1, undefined>;
declare function intersect<const TOptions$1 extends IntersectOptions, const TMessage extends ErrorMessage<IntersectIssue> | undefined>(options: TOptions$1, message: TMessage): IntersectSchema<TOptions$1, TMessage>;
//#endregion
//#region src/schemas/intersect/intersectAsync.d.ts
/**
* Intersect schema async interface.
*/
export interface IntersectSchemaAsync<TOptions$1 extends IntersectOptionsAsync, TMessage extends ErrorMessage<IntersectIssue> | undefined> extends BaseSchemaAsync<InferIntersectInput<TOptions$1>, InferIntersectOutput<TOptions$1>, IntersectIssue | InferIssue<TOptions$1[number]>> {
	/**
	* The schema type.
	*/
	readonly type: "intersect";
	/**
	* The schema reference.
	*/
	readonly reference: typeof intersect | typeof intersectAsync;
	/**
	* The intersect options.
	*/
	readonly options: TOptions$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function intersectAsync<const TOptions$1 extends IntersectOptionsAsync>(options: TOptions$1): IntersectSchemaAsync<TOptions$1, undefined>;
declare function intersectAsync<const TOptions$1 extends IntersectOptionsAsync, const TMessage extends ErrorMessage<IntersectIssue> | undefined>(options: TOptions$1, message: TMessage): IntersectSchemaAsync<TOptions$1, TMessage>;
//#endregion
//#region src/schemas/lazy/lazy.d.ts
/**
* Lazy schema interface.
*/
export interface LazySchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>> extends BaseSchema<InferInput<TWrapped$1>, InferOutput<TWrapped$1>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "lazy";
	/**
	* The schema reference.
	*/
	readonly reference: typeof lazy;
	/**
	* The expected property.
	*/
	readonly expects: "unknown";
	/**
	* The schema getter.
	*/
	readonly getter: (input: unknown) => TWrapped$1;
}
declare function lazy<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(getter: (input: unknown) => TWrapped$1): LazySchema<TWrapped$1>;
//#endregion
//#region src/schemas/lazy/lazyAsync.d.ts
/**
* Lazy schema async interface.
*/
export interface LazySchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> extends BaseSchemaAsync<InferInput<TWrapped$1>, InferOutput<TWrapped$1>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "lazy";
	/**
	* The schema reference.
	*/
	readonly reference: typeof lazy | typeof lazyAsync;
	/**
	* The expected property.
	*/
	readonly expects: "unknown";
	/**
	* The schema getter.
	*/
	readonly getter: (input: unknown) => MaybePromise<TWrapped$1>;
}
declare function lazyAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(getter: (input: unknown) => MaybePromise<TWrapped$1>): LazySchemaAsync<TWrapped$1>;
//#endregion
//#region src/schemas/literal/literal.d.ts
/**
* Literal type.
*/
export type Literal = bigint | boolean | number | string | symbol;
/**
* Literal issue interface.
*/
export interface LiteralIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "literal";
	/**
	* The expected property.
	*/
	readonly expected: string;
}
/**
* Literal schema interface.
*/
export interface LiteralSchema<TLiteral extends Literal, TMessage extends ErrorMessage<LiteralIssue> | undefined> extends BaseSchema<TLiteral, TLiteral, LiteralIssue> {
	/**
	* The schema type.
	*/
	readonly type: "literal";
	/**
	* The schema reference.
	*/
	readonly reference: typeof literal;
	/**
	* The literal value.
	*/
	readonly literal: TLiteral;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function literal<const TLiteral extends Literal>(literal_: TLiteral): LiteralSchema<TLiteral, undefined>;
declare function literal<const TLiteral extends Literal, const TMessage extends ErrorMessage<LiteralIssue> | undefined>(literal_: TLiteral, message: TMessage): LiteralSchema<TLiteral, TMessage>;
//#endregion
//#region src/schemas/looseObject/types.d.ts
/**
* Loose object issue interface.
*/
export interface LooseObjectIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "loose_object";
	/**
	* The expected property.
	*/
	readonly expected: "Object" | `"${string}"`;
}
//#endregion
//#region src/schemas/looseObject/looseObject.d.ts
/**
* Loose object schema interface.
*/
export interface LooseObjectSchema<TEntries$1 extends ObjectEntries, TMessage extends ErrorMessage<LooseObjectIssue> | undefined> extends BaseSchema<InferObjectInput<TEntries$1> & {
	[key: string]: unknown;
}, InferObjectOutput<TEntries$1> & {
	[key: string]: unknown;
}, LooseObjectIssue | InferObjectIssue<TEntries$1>> {
	/**
	* The schema type.
	*/
	readonly type: "loose_object";
	/**
	* The schema reference.
	*/
	readonly reference: typeof looseObject;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function looseObject<const TEntries$1 extends ObjectEntries>(entries: TEntries$1): LooseObjectSchema<TEntries$1, undefined>;
declare function looseObject<const TEntries$1 extends ObjectEntries, const TMessage extends ErrorMessage<LooseObjectIssue> | undefined>(entries: TEntries$1, message: TMessage): LooseObjectSchema<TEntries$1, TMessage>;
//#endregion
//#region src/schemas/looseObject/looseObjectAsync.d.ts
/**
* Object schema async interface.
*/
export interface LooseObjectSchemaAsync<TEntries$1 extends ObjectEntriesAsync, TMessage extends ErrorMessage<LooseObjectIssue> | undefined> extends BaseSchemaAsync<InferObjectInput<TEntries$1> & {
	[key: string]: unknown;
}, InferObjectOutput<TEntries$1> & {
	[key: string]: unknown;
}, LooseObjectIssue | InferObjectIssue<TEntries$1>> {
	/**
	* The schema type.
	*/
	readonly type: "loose_object";
	/**
	* The schema reference.
	*/
	readonly reference: typeof looseObject | typeof looseObjectAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function looseObjectAsync<const TEntries$1 extends ObjectEntriesAsync>(entries: TEntries$1): LooseObjectSchemaAsync<TEntries$1, undefined>;
declare function looseObjectAsync<const TEntries$1 extends ObjectEntriesAsync, const TMessage extends ErrorMessage<LooseObjectIssue> | undefined>(entries: TEntries$1, message: TMessage): LooseObjectSchemaAsync<TEntries$1, TMessage>;
//#endregion
//#region src/schemas/looseTuple/types.d.ts
/**
* Loose tuple issue interface.
*/
export interface LooseTupleIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "loose_tuple";
	/**
	* The expected property.
	*/
	readonly expected: "Array";
}
//#endregion
//#region src/schemas/looseTuple/looseTuple.d.ts
/**
* Loose tuple schema interface.
*/
export interface LooseTupleSchema<TItems$1 extends TupleItems, TMessage extends ErrorMessage<LooseTupleIssue> | undefined> extends BaseSchema<[
	...InferTupleInput<TItems$1>,
	...unknown[]
], [
	...InferTupleOutput<TItems$1>,
	...unknown[]
], LooseTupleIssue | InferTupleIssue<TItems$1>> {
	/**
	* The schema type.
	*/
	readonly type: "loose_tuple";
	/**
	* The schema reference.
	*/
	readonly reference: typeof looseTuple;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function looseTuple<const TItems$1 extends TupleItems>(items: TItems$1): LooseTupleSchema<TItems$1, undefined>;
declare function looseTuple<const TItems$1 extends TupleItems, const TMessage extends ErrorMessage<LooseTupleIssue> | undefined>(items: TItems$1, message: TMessage): LooseTupleSchema<TItems$1, TMessage>;
//#endregion
//#region src/schemas/looseTuple/looseTupleAsync.d.ts
/**
* Loose tuple schema async interface.
*/
export interface LooseTupleSchemaAsync<TItems$1 extends TupleItemsAsync, TMessage extends ErrorMessage<LooseTupleIssue> | undefined> extends BaseSchemaAsync<[
	...InferTupleInput<TItems$1>,
	...unknown[]
], [
	...InferTupleOutput<TItems$1>,
	...unknown[]
], LooseTupleIssue | InferTupleIssue<TItems$1>> {
	/**
	* The schema type.
	*/
	readonly type: "loose_tuple";
	/**
	* The schema reference.
	*/
	readonly reference: typeof looseTuple | typeof looseTupleAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function looseTupleAsync<const TItems$1 extends TupleItemsAsync>(items: TItems$1): LooseTupleSchemaAsync<TItems$1, undefined>;
declare function looseTupleAsync<const TItems$1 extends TupleItemsAsync, const TMessage extends ErrorMessage<LooseTupleIssue> | undefined>(items: TItems$1, message: TMessage): LooseTupleSchemaAsync<TItems$1, TMessage>;
//#endregion
//#region src/schemas/map/types.d.ts
/**
* Map issue interface.
*/
export interface MapIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "map";
	/**
	* The expected property.
	*/
	readonly expected: "Map";
}
/**
* Infer map input type.
*/
export type InferMapInput<TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = Map<InferInput<TKey$1>, InferInput<TValue$1>>;
/**
* Infer map output type.
*/
export type InferMapOutput<TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = Map<InferOutput<TKey$1>, InferOutput<TValue$1>>;
//#endregion
//#region src/schemas/map/map.d.ts
/**
* Map schema interface.
*/
export interface MapSchema<TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<MapIssue> | undefined> extends BaseSchema<InferMapInput<TKey$1, TValue$1>, InferMapOutput<TKey$1, TValue$1>, MapIssue | InferIssue<TKey$1> | InferIssue<TValue$1>> {
	/**
	* The schema type.
	*/
	readonly type: "map";
	/**
	* The schema reference.
	*/
	readonly reference: typeof map$1;
	/**
	* The expected property.
	*/
	readonly expects: "Map";
	/**
	* The map key schema.
	*/
	readonly key: TKey$1;
	/**
	* The map value schema.
	*/
	readonly value: TValue$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function map$1<const TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(key: TKey$1, value: TValue$1): MapSchema<TKey$1, TValue$1, undefined>;
declare function map$1<const TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<MapIssue> | undefined>(key: TKey$1, value: TValue$1, message: TMessage): MapSchema<TKey$1, TValue$1, TMessage>;
//#endregion
//#region src/schemas/map/mapAsync.d.ts
/**
* Map schema async interface.
*/
export interface MapSchemaAsync<TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<MapIssue> | undefined> extends BaseSchemaAsync<InferMapInput<TKey$1, TValue$1>, InferMapOutput<TKey$1, TValue$1>, MapIssue | InferIssue<TKey$1> | InferIssue<TValue$1>> {
	/**
	* The schema type.
	*/
	readonly type: "map";
	/**
	* The schema reference.
	*/
	readonly reference: typeof map$1 | typeof mapAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Map";
	/**
	* The map key schema.
	*/
	readonly key: TKey$1;
	/**
	* The map value schema.
	*/
	readonly value: TValue$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function mapAsync<const TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(key: TKey$1, value: TValue$1): MapSchemaAsync<TKey$1, TValue$1, undefined>;
declare function mapAsync<const TKey$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<MapIssue> | undefined>(key: TKey$1, value: TValue$1, message: TMessage): MapSchemaAsync<TKey$1, TValue$1, TMessage>;
//#endregion
//#region src/schemas/nan/nan.d.ts
/**
* NaN issue interface.
*/
export interface NanIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "nan";
	/**
	* The expected property.
	*/
	readonly expected: "NaN";
}
/**
* NaN schema interface.
*/
export interface NanSchema<TMessage extends ErrorMessage<NanIssue> | undefined> extends BaseSchema<number, number, NanIssue> {
	/**
	* The schema type.
	*/
	readonly type: "nan";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nan;
	/**
	* The expected property.
	*/
	readonly expects: "NaN";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nan(): NanSchema<undefined>;
declare function nan<const TMessage extends ErrorMessage<NanIssue> | undefined>(message: TMessage): NanSchema<TMessage>;
//#endregion
//#region src/schemas/never/never.d.ts
/**
* Never issue interface.
*/
export interface NeverIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "never";
	/**
	* The expected property.
	*/
	readonly expected: "never";
}
/**
* Never schema interface.
*/
export interface NeverSchema<TMessage extends ErrorMessage<NeverIssue> | undefined> extends BaseSchema<never, never, NeverIssue> {
	/**
	* The schema type.
	*/
	readonly type: "never";
	/**
	* The schema reference.
	*/
	readonly reference: typeof never;
	/**
	* The expected property.
	*/
	readonly expects: "never";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function never(): NeverSchema<undefined>;
declare function never<const TMessage extends ErrorMessage<NeverIssue> | undefined>(message: TMessage): NeverSchema<TMessage>;
//#endregion
//#region src/schemas/union/types.d.ts
/**
* Union issue interface.
*/
export interface UnionIssue<TSubIssue extends BaseIssue<unknown>> extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "union";
	/**
	* The expected property.
	*/
	readonly expected: string;
	/**
	* The sub issues.
	*/
	readonly issues?: [
		TSubIssue,
		...TSubIssue[]
	];
}
//#endregion
//#region src/schemas/union/union.d.ts
/**
* Union options type.
*/
export type UnionOptions = MaybeReadonly<BaseSchema<unknown, unknown, BaseIssue<unknown>>[]>;
/**
* Union schema interface.
*/
export interface UnionSchema<TOptions$1 extends UnionOptions, TMessage extends ErrorMessage<UnionIssue<InferIssue<TOptions$1[number]>>> | undefined> extends BaseSchema<InferInput<TOptions$1[number]>, InferOutput<TOptions$1[number]>, UnionIssue<InferIssue<TOptions$1[number]>> | InferIssue<TOptions$1[number]>> {
	/**
	* The schema type.
	*/
	readonly type: "union";
	/**
	* The schema reference.
	*/
	readonly reference: typeof union;
	/**
	* The union options.
	*/
	readonly options: TOptions$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function union<const TOptions$1 extends UnionOptions>(options: TOptions$1): UnionSchema<TOptions$1, undefined>;
declare function union<const TOptions$1 extends UnionOptions, const TMessage extends ErrorMessage<UnionIssue<InferIssue<TOptions$1[number]>>> | undefined>(options: TOptions$1, message: TMessage): UnionSchema<TOptions$1, TMessage>;
//#endregion
//#region src/schemas/union/unionAsync.d.ts
/**
* Union options async type.
*/
export type UnionOptionsAsync = MaybeReadonly<(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)[]>;
/**
* Union schema async interface.
*/
export interface UnionSchemaAsync<TOptions$1 extends UnionOptionsAsync, TMessage extends ErrorMessage<UnionIssue<InferIssue<TOptions$1[number]>>> | undefined> extends BaseSchemaAsync<InferInput<TOptions$1[number]>, InferOutput<TOptions$1[number]>, UnionIssue<InferIssue<TOptions$1[number]>> | InferIssue<TOptions$1[number]>> {
	/**
	* The schema type.
	*/
	readonly type: "union";
	/**
	* The schema reference.
	*/
	readonly reference: typeof union | typeof unionAsync;
	/**
	* The union options.
	*/
	readonly options: TOptions$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function unionAsync<const TOptions$1 extends UnionOptionsAsync>(options: TOptions$1): UnionSchemaAsync<TOptions$1, undefined>;
declare function unionAsync<const TOptions$1 extends UnionOptionsAsync, const TMessage extends ErrorMessage<UnionIssue<InferIssue<TOptions$1[number]>>> | undefined>(options: TOptions$1, message: TMessage): UnionSchemaAsync<TOptions$1, TMessage>;
//#endregion
//#region src/schemas/nonNullable/types.d.ts
/**
* Non nullable issue interface.
*/
export interface NonNullableIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "non_nullable";
	/**
	* The expected property.
	*/
	readonly expected: "!null";
}
/**
* Infer non nullable input type.
*/
export type InferNonNullableInput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = NonNullable$1<InferInput<TWrapped$1>>;
/**
* Infer non nullable output type.
*/
export type InferNonNullableOutput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = NonNullable$1<InferOutput<TWrapped$1>>;
/**
* Infer non nullable issue type.
*/
export type InferNonNullableIssue<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TWrapped$1 extends UnionSchema<UnionOptions, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> | UnionSchemaAsync<UnionOptionsAsync, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> ? Exclude<InferIssue<TWrapped$1>, {
	type: "null" | "union";
}> | UnionIssue<InferNonNullableIssue<TWrapped$1["options"][number]>> : Exclude<InferIssue<TWrapped$1>, {
	type: "null";
}>;
//#endregion
//#region src/schemas/nonNullable/nonNullable.d.ts
/**
* Non nullable schema interface.
*/
export interface NonNullableSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<NonNullableIssue> | undefined> extends BaseSchema<InferNonNullableInput<TWrapped$1>, InferNonNullableOutput<TWrapped$1>, NonNullableIssue | InferNonNullableIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "non_nullable";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nonNullable;
	/**
	* The expected property.
	*/
	readonly expects: "!null";
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nonNullable<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NonNullableSchema<TWrapped$1, undefined>;
declare function nonNullable<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<NonNullableIssue> | undefined>(wrapped: TWrapped$1, message: TMessage): NonNullableSchema<TWrapped$1, TMessage>;
//#endregion
//#region src/schemas/nonNullable/nonNullableAsync.d.ts
/**
* Non nullable schema async interface.
*/
export interface NonNullableSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<NonNullableIssue> | undefined> extends BaseSchemaAsync<InferNonNullableInput<TWrapped$1>, InferNonNullableOutput<TWrapped$1>, NonNullableIssue | InferNonNullableIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "non_nullable";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nonNullable | typeof nonNullableAsync;
	/**
	* The expected property.
	*/
	readonly expects: "!null";
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nonNullableAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NonNullableSchemaAsync<TWrapped$1, undefined>;
declare function nonNullableAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<NonNullableIssue> | undefined>(wrapped: TWrapped$1, message: TMessage): NonNullableSchemaAsync<TWrapped$1, TMessage>;
//#endregion
//#region src/schemas/nonNullish/types.d.ts
/**
* Non nullish issue interface.
*/
export interface NonNullishIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "non_nullish";
	/**
	* The expected property.
	*/
	readonly expected: "(!null & !undefined)";
}
/**
* Infer non nullish input type.
*/
export type InferNonNullishInput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = NonNullish<InferInput<TWrapped$1>>;
/**
* Infer non nullish output type.
*/
export type InferNonNullishOutput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = NonNullish<InferOutput<TWrapped$1>>;
/**
* Infer non nullish issue type.
*/
export type InferNonNullishIssue<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TWrapped$1 extends UnionSchema<UnionOptions, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> | UnionSchemaAsync<UnionOptionsAsync, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> ? Exclude<InferIssue<TWrapped$1>, {
	type: "null" | "undefined" | "union";
}> | UnionIssue<InferNonNullishIssue<TWrapped$1["options"][number]>> : Exclude<InferIssue<TWrapped$1>, {
	type: "null" | "undefined";
}>;
//#endregion
//#region src/schemas/nonNullish/nonNullish.d.ts
/**
* Non nullish schema interface.
*/
export interface NonNullishSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<NonNullishIssue> | undefined> extends BaseSchema<InferNonNullishInput<TWrapped$1>, InferNonNullishOutput<TWrapped$1>, NonNullishIssue | InferNonNullishIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "non_nullish";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nonNullish;
	/**
	* The expected property.
	*/
	readonly expects: "(!null & !undefined)";
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nonNullish<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NonNullishSchema<TWrapped$1, undefined>;
declare function nonNullish<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<NonNullishIssue> | undefined>(wrapped: TWrapped$1, message: TMessage): NonNullishSchema<TWrapped$1, TMessage>;
//#endregion
//#region src/schemas/nonNullish/nonNullishAsync.d.ts
/**
* Non nullish schema async interface.
*/
export interface NonNullishSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<NonNullishIssue> | undefined> extends BaseSchemaAsync<InferNonNullishInput<TWrapped$1>, InferNonNullishOutput<TWrapped$1>, NonNullishIssue | InferNonNullishIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "non_nullish";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nonNullish | typeof nonNullishAsync;
	/**
	* The expected property.
	*/
	readonly expects: "(!null & !undefined)";
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nonNullishAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NonNullishSchemaAsync<TWrapped$1, undefined>;
declare function nonNullishAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<NonNullishIssue> | undefined>(wrapped: TWrapped$1, message: TMessage): NonNullishSchemaAsync<TWrapped$1, TMessage>;
//#endregion
//#region src/schemas/nonOptional/types.d.ts
/**
* Non optional issue interface.
*/
export interface NonOptionalIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "non_optional";
	/**
	* The expected property.
	*/
	readonly expected: "!undefined";
}
/**
* Infer non optional input type.
*/
export type InferNonOptionalInput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = NonOptional<InferInput<TWrapped$1>>;
/**
* Infer non optional output type.
*/
export type InferNonOptionalOutput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = NonOptional<InferOutput<TWrapped$1>>;
/**
* Infer non optional issue type.
*/
export type InferNonOptionalIssue<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = TWrapped$1 extends UnionSchema<UnionOptions, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> | UnionSchemaAsync<UnionOptionsAsync, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> ? Exclude<InferIssue<TWrapped$1>, {
	type: "undefined" | "union";
}> | UnionIssue<InferNonOptionalIssue<TWrapped$1["options"][number]>> : Exclude<InferIssue<TWrapped$1>, {
	type: "undefined";
}>;
//#endregion
//#region src/schemas/nonOptional/nonOptional.d.ts
/**
* Non optional schema interface.
*/
export interface NonOptionalSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<NonOptionalIssue> | undefined> extends BaseSchema<InferNonOptionalInput<TWrapped$1>, InferNonOptionalOutput<TWrapped$1>, NonOptionalIssue | InferNonOptionalIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "non_optional";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nonOptional;
	/**
	* The expected property.
	*/
	readonly expects: "!undefined";
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nonOptional<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NonOptionalSchema<TWrapped$1, undefined>;
declare function nonOptional<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<NonOptionalIssue> | undefined>(wrapped: TWrapped$1, message: TMessage): NonOptionalSchema<TWrapped$1, TMessage>;
//#endregion
//#region src/schemas/nonOptional/nonOptionalAsync.d.ts
/**
* Non optional schema async interface.
*/
export interface NonOptionalSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<NonOptionalIssue> | undefined> extends BaseSchemaAsync<InferNonOptionalInput<TWrapped$1>, InferNonOptionalOutput<TWrapped$1>, NonOptionalIssue | InferNonOptionalIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "non_optional";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nonOptional | typeof nonOptionalAsync;
	/**
	* The expected property.
	*/
	readonly expects: "!undefined";
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nonOptionalAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NonOptionalSchemaAsync<TWrapped$1, undefined>;
declare function nonOptionalAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<NonOptionalIssue> | undefined>(wrapped: TWrapped$1, message: TMessage): NonOptionalSchemaAsync<TWrapped$1, TMessage>;
//#endregion
//#region src/schemas/null/null.d.ts
/**
* Null issue interface.
*/
export interface NullIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "null";
	/**
	* The expected property.
	*/
	readonly expected: "null";
}
/**
* Null schema interface.
*/
export interface NullSchema<TMessage extends ErrorMessage<NullIssue> | undefined> extends BaseSchema<null, null, NullIssue> {
	/**
	* The schema type.
	*/
	readonly type: "null";
	/**
	* The schema reference.
	*/
	readonly reference: typeof null_;
	/**
	* The expected property.
	*/
	readonly expects: "null";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function null_(): NullSchema<undefined>;
declare function null_<const TMessage extends ErrorMessage<NullIssue> | undefined>(message: TMessage): NullSchema<TMessage>;
//#endregion
//#region src/schemas/nullable/types.d.ts
/**
* Infer nullable output type.
*/
export type InferNullableOutput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, null>> = undefined extends TDefault ? InferOutput<TWrapped$1> | null : InferOutput<TWrapped$1> | Extract<DefaultValue<TDefault>, null>;
//#endregion
//#region src/schemas/nullable/nullable.d.ts
/**
* Nullable schema interface.
*/
export interface NullableSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TDefault extends Default<TWrapped$1, null>> extends BaseSchema<InferInput<TWrapped$1> | null, InferNullableOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "nullable";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nullable;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | null)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function nullable<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NullableSchema<TWrapped$1, undefined>;
declare function nullable<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TDefault extends Default<TWrapped$1, null>>(wrapped: TWrapped$1, default_: TDefault): NullableSchema<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/nullable/nullableAsync.d.ts
/**
* Nullable schema async interface.
*/
export interface NullableSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, null>> extends BaseSchemaAsync<InferInput<TWrapped$1> | null, InferNullableOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "nullable";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nullable | typeof nullableAsync;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | null)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function nullableAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NullableSchemaAsync<TWrapped$1, undefined>;
declare function nullableAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TDefault extends DefaultAsync<TWrapped$1, null>>(wrapped: TWrapped$1, default_: TDefault): NullableSchemaAsync<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/nullish/types.d.ts
/**
* Infer nullish output type.
*/
export type InferNullishOutput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, null | undefined>> = undefined extends TDefault ? InferOutput<TWrapped$1> | null | undefined : InferOutput<TWrapped$1> | Extract<DefaultValue<TDefault>, null | undefined>;
//#endregion
//#region src/schemas/nullish/nullish.d.ts
/**
* Nullish schema interface.
*/
export interface NullishSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TDefault extends Default<TWrapped$1, null | undefined>> extends BaseSchema<InferInput<TWrapped$1> | null | undefined, InferNullishOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "nullish";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nullish;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | null | undefined)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function nullish<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NullishSchema<TWrapped$1, undefined>;
declare function nullish<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TDefault extends Default<TWrapped$1, null | undefined>>(wrapped: TWrapped$1, default_: TDefault): NullishSchema<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/nullish/nullishAsync.d.ts
/**
* Nullish schema async interface.
*/
export interface NullishSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, null | undefined>> extends BaseSchemaAsync<InferInput<TWrapped$1> | null | undefined, InferNullishOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "nullish";
	/**
	* The schema reference.
	*/
	readonly reference: typeof nullish | typeof nullishAsync;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | null | undefined)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function nullishAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): NullishSchemaAsync<TWrapped$1, undefined>;
declare function nullishAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TDefault extends DefaultAsync<TWrapped$1, null | undefined>>(wrapped: TWrapped$1, default_: TDefault): NullishSchemaAsync<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/number/number.d.ts
/**
* Number issue interface.
*/
export interface NumberIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "number";
	/**
	* The expected property.
	*/
	readonly expected: "number";
}
/**
* Number schema interface.
*/
export interface NumberSchema<TMessage extends ErrorMessage<NumberIssue> | undefined> extends BaseSchema<number, number, NumberIssue> {
	/**
	* The schema type.
	*/
	readonly type: "number";
	/**
	* The schema reference.
	*/
	readonly reference: typeof number;
	/**
	* The expected property.
	*/
	readonly expects: "number";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function number(): NumberSchema<undefined>;
declare function number<const TMessage extends ErrorMessage<NumberIssue> | undefined>(message: TMessage): NumberSchema<TMessage>;
//#endregion
//#region src/schemas/object/types.d.ts
/**
* Object issue interface.
*/
export interface ObjectIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "object";
	/**
	* The expected property.
	*/
	readonly expected: "Object" | `"${string}"`;
}
//#endregion
//#region src/schemas/object/object.d.ts
/**
* Object schema interface.
*/
export interface ObjectSchema<TEntries$1 extends ObjectEntries, TMessage extends ErrorMessage<ObjectIssue> | undefined> extends BaseSchema<InferObjectInput<TEntries$1>, InferObjectOutput<TEntries$1>, ObjectIssue | InferObjectIssue<TEntries$1>> {
	/**
	* The schema type.
	*/
	readonly type: "object";
	/**
	* The schema reference.
	*/
	readonly reference: typeof object;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function object<const TEntries$1 extends ObjectEntries>(entries: TEntries$1): ObjectSchema<TEntries$1, undefined>;
declare function object<const TEntries$1 extends ObjectEntries, const TMessage extends ErrorMessage<ObjectIssue> | undefined>(entries: TEntries$1, message: TMessage): ObjectSchema<TEntries$1, TMessage>;
//#endregion
//#region src/schemas/object/objectAsync.d.ts
/**
* Object schema async interface.
*/
export interface ObjectSchemaAsync<TEntries$1 extends ObjectEntriesAsync, TMessage extends ErrorMessage<ObjectIssue> | undefined> extends BaseSchemaAsync<InferObjectInput<TEntries$1>, InferObjectOutput<TEntries$1>, ObjectIssue | InferObjectIssue<TEntries$1>> {
	/**
	* The schema type.
	*/
	readonly type: "object";
	/**
	* The schema reference.
	*/
	readonly reference: typeof object | typeof objectAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function objectAsync<const TEntries$1 extends ObjectEntriesAsync>(entries: TEntries$1): ObjectSchemaAsync<TEntries$1, undefined>;
declare function objectAsync<const TEntries$1 extends ObjectEntriesAsync, const TMessage extends ErrorMessage<ObjectIssue> | undefined>(entries: TEntries$1, message: TMessage): ObjectSchemaAsync<TEntries$1, TMessage>;
//#endregion
//#region src/schemas/objectWithRest/types.d.ts
/**
* Object with rest issue interface.
*/
export interface ObjectWithRestIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "object_with_rest";
	/**
	* The expected property.
	*/
	readonly expected: "Object" | `"${string}"`;
}
//#endregion
//#region src/schemas/objectWithRest/objectWithRest.d.ts
/**
* Object with rest schema interface.
*/
export interface ObjectWithRestSchema<TEntries$1 extends ObjectEntries, TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined> extends BaseSchema<InferObjectInput<TEntries$1> & {
	[key: string]: InferInput<TRest$1>;
}, InferObjectOutput<TEntries$1> & {
	[key: string]: InferOutput<TRest$1>;
}, ObjectWithRestIssue | InferObjectIssue<TEntries$1> | InferIssue<TRest$1>> {
	/**
	* The schema type.
	*/
	readonly type: "object_with_rest";
	/**
	* The schema reference.
	*/
	readonly reference: typeof objectWithRest;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The rest schema.
	*/
	readonly rest: TRest$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function objectWithRest<const TEntries$1 extends ObjectEntries, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(entries: TEntries$1, rest: TRest$1): ObjectWithRestSchema<TEntries$1, TRest$1, undefined>;
declare function objectWithRest<const TEntries$1 extends ObjectEntries, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined>(entries: TEntries$1, rest: TRest$1, message: TMessage): ObjectWithRestSchema<TEntries$1, TRest$1, TMessage>;
//#endregion
//#region src/schemas/objectWithRest/objectWithRestAsync.d.ts
/**
* Object schema async interface.
*/
export interface ObjectWithRestSchemaAsync<TEntries$1 extends ObjectEntriesAsync, TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined> extends BaseSchemaAsync<InferObjectInput<TEntries$1> & {
	[key: string]: InferInput<TRest$1>;
}, InferObjectOutput<TEntries$1> & {
	[key: string]: InferOutput<TRest$1>;
}, ObjectWithRestIssue | InferObjectIssue<TEntries$1> | InferIssue<TRest$1>> {
	/**
	* The schema type.
	*/
	readonly type: "object_with_rest";
	/**
	* The schema reference.
	*/
	readonly reference: typeof objectWithRest | typeof objectWithRestAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The rest schema.
	*/
	readonly rest: TRest$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function objectWithRestAsync<const TEntries$1 extends ObjectEntriesAsync, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(entries: TEntries$1, rest: TRest$1): ObjectWithRestSchemaAsync<TEntries$1, TRest$1, undefined>;
declare function objectWithRestAsync<const TEntries$1 extends ObjectEntriesAsync, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined>(entries: TEntries$1, rest: TRest$1, message: TMessage): ObjectWithRestSchemaAsync<TEntries$1, TRest$1, TMessage>;
//#endregion
//#region src/schemas/optional/types.d.ts
/**
* Infer optional output type.
*/
export type InferOptionalOutput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, undefined>> = undefined extends TDefault ? InferOutput<TWrapped$1> | undefined : InferOutput<TWrapped$1> | Extract<DefaultValue<TDefault>, undefined>;
//#endregion
//#region src/schemas/optional/optional.d.ts
/**
* Optional schema interface.
*/
export interface OptionalSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TDefault extends Default<TWrapped$1, undefined>> extends BaseSchema<InferInput<TWrapped$1> | undefined, InferOptionalOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "optional";
	/**
	* The schema reference.
	*/
	readonly reference: typeof optional;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | undefined)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function optional<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): OptionalSchema<TWrapped$1, undefined>;
declare function optional<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TDefault extends Default<TWrapped$1, undefined>>(wrapped: TWrapped$1, default_: TDefault): OptionalSchema<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/optional/optionalAsync.d.ts
/**
* Optional schema async interface.
*/
export interface OptionalSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, undefined>> extends BaseSchemaAsync<InferInput<TWrapped$1> | undefined, InferOptionalOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "optional";
	/**
	* The schema reference.
	*/
	readonly reference: typeof optional | typeof optionalAsync;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | undefined)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function optionalAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): OptionalSchemaAsync<TWrapped$1, undefined>;
declare function optionalAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TDefault extends DefaultAsync<TWrapped$1, undefined>>(wrapped: TWrapped$1, default_: TDefault): OptionalSchemaAsync<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/picklist/picklist.d.ts
/**
* Picklist options type.
*/
export type PicklistOptions = MaybeReadonly<(string | number | bigint)[]>;
/**
* Picklist issue interface.
*/
export interface PicklistIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "picklist";
	/**
	* The expected property.
	*/
	readonly expected: string;
}
/**
* Picklist schema interface.
*/
export interface PicklistSchema<TOptions$1 extends PicklistOptions, TMessage extends ErrorMessage<PicklistIssue> | undefined> extends BaseSchema<TOptions$1[number], TOptions$1[number], PicklistIssue> {
	/**
	* The schema type.
	*/
	readonly type: "picklist";
	/**
	* The schema reference.
	*/
	readonly reference: typeof picklist;
	/**
	* The picklist options.
	*/
	readonly options: TOptions$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function picklist<const TOptions$1 extends PicklistOptions>(options: TOptions$1): PicklistSchema<TOptions$1, undefined>;
declare function picklist<const TOptions$1 extends PicklistOptions, const TMessage extends ErrorMessage<PicklistIssue> | undefined>(options: TOptions$1, message: TMessage): PicklistSchema<TOptions$1, TMessage>;
//#endregion
//#region src/schemas/promise/promise.d.ts
/**
* Promise issue interface.
*/
export interface PromiseIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "promise";
	/**
	* The expected property.
	*/
	readonly expected: "Promise";
}
/**
* Promise schema interface.
*/
export interface PromiseSchema<TMessage extends ErrorMessage<PromiseIssue> | undefined> extends BaseSchema<Promise<unknown>, Promise<unknown>, PromiseIssue> {
	/**
	* The schema type.
	*/
	readonly type: "promise";
	/**
	* The schema reference.
	*/
	readonly reference: typeof promise;
	/**
	* The expected property.
	*/
	readonly expects: "Promise";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function promise(): PromiseSchema<undefined>;
declare function promise<const TMessage extends ErrorMessage<PromiseIssue> | undefined>(message: TMessage): PromiseSchema<TMessage>;
//#endregion
//#region src/schemas/record/types.d.ts
/**
* Record issue interface.
*/
export interface RecordIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "record";
	/**
	* The expected property.
	*/
	readonly expected: "Object";
}
/**
* Is literal type.
*/
export type IsLiteral<TKey$1 extends string | number | symbol> = string extends TKey$1 ? false : number extends TKey$1 ? false : symbol extends TKey$1 ? false : TKey$1 extends Brand<string | number | symbol> ? false : true;
/**
* Optional keys type.
*/
export type OptionalKeys<TObject extends Record<string | number | symbol, unknown>> = {
	[TKey in keyof TObject]: IsLiteral<TKey> extends true ? TKey : never;
}[keyof TObject];
/**
* With question marks type.
*
* Hint: We mark an entry as optional if we detect that its key is a literal
* type. The reason for this is that it is not technically possible to detect
* missing literal keys without restricting the key schema to `string`, `enum`
* and `picklist`. However, if `enum` and `picklist` are used, it is better to
* use `object` with `entriesFromList` because it already covers the needed
* functionality. This decision also reduces the bundle size of `record`,
* because it only needs to check the entries of the input and not any missing
* keys.
*/
export type WithQuestionMarks<TObject extends Record<string | number | symbol, unknown>> = MarkOptional<TObject, OptionalKeys<TObject>>;
/**
* With readonly type.
*/
export type WithReadonly<TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TObject extends WithQuestionMarks<Record<string | number | symbol, unknown>>> = TValue$1 extends {
	readonly pipe: readonly unknown[];
} ? ReadonlyAction<any> extends TValue$1["pipe"][number] ? Readonly<TObject> : TObject : TObject;
/**
* Infer record input type.
*/
export type InferRecordInput<TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>> | BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = Prettify<WithQuestionMarks<Record<InferInput<TKey$1>, InferInput<TValue$1>>>>;
/**
* Infer record output type.
*/
export type InferRecordOutput<TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>> | BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = Prettify<WithReadonly<TValue$1, WithQuestionMarks<Record<InferOutput<TKey$1>, InferOutput<TValue$1>>>>>;
//#endregion
//#region src/schemas/record/record.d.ts
/**
* Record schema interface.
*/
export interface RecordSchema<TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<RecordIssue> | undefined> extends BaseSchema<InferRecordInput<TKey$1, TValue$1>, InferRecordOutput<TKey$1, TValue$1>, RecordIssue | InferIssue<TKey$1> | InferIssue<TValue$1>> {
	/**
	* The schema type.
	*/
	readonly type: "record";
	/**
	* The schema reference.
	*/
	readonly reference: typeof record;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The record key schema.
	*/
	readonly key: TKey$1;
	/**
	* The record value schema.
	*/
	readonly value: TValue$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function record<const TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(key: TKey$1, value: TValue$1): RecordSchema<TKey$1, TValue$1, undefined>;
declare function record<const TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<RecordIssue> | undefined>(key: TKey$1, value: TValue$1, message: TMessage): RecordSchema<TKey$1, TValue$1, TMessage>;
//#endregion
//#region src/schemas/record/recordAsync.d.ts
/**
* Record schema async interface.
*/
export interface RecordSchemaAsync<TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>> | BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>, TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<RecordIssue> | undefined> extends BaseSchemaAsync<InferRecordInput<TKey$1, TValue$1>, InferRecordOutput<TKey$1, TValue$1>, RecordIssue | InferIssue<TKey$1> | InferIssue<TValue$1>> {
	/**
	* The schema type.
	*/
	readonly type: "record";
	/**
	* The schema reference.
	*/
	readonly reference: typeof record | typeof recordAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The record key schema.
	*/
	readonly key: TKey$1;
	/**
	* The record value schema.
	*/
	readonly value: TValue$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function recordAsync<const TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>> | BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(key: TKey$1, value: TValue$1): RecordSchemaAsync<TKey$1, TValue$1, undefined>;
declare function recordAsync<const TKey$1 extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>> | BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>, const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<RecordIssue> | undefined>(key: TKey$1, value: TValue$1, message: TMessage): RecordSchemaAsync<TKey$1, TValue$1, TMessage>;
//#endregion
//#region src/schemas/set/types.d.ts
/**
* Set issue interface.
*/
export interface SetIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "set";
	/**
	* The expected property.
	*/
	readonly expected: "Set";
}
/**
* Infer set input type.
*/
export type InferSetInput<TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = Set<InferInput<TValue$1>>;
/**
* Infer set output type.
*/
export type InferSetOutput<TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> = Set<InferOutput<TValue$1>>;
//#endregion
//#region src/schemas/set/set.d.ts
/**
* Set schema interface.
*/
export interface SetSchema<TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<SetIssue> | undefined> extends BaseSchema<InferSetInput<TValue$1>, InferSetOutput<TValue$1>, SetIssue | InferIssue<TValue$1>> {
	/**
	* The schema type.
	*/
	readonly type: "set";
	/**
	* The schema reference.
	*/
	readonly reference: typeof set;
	/**
	* The expected property.
	*/
	readonly expects: "Set";
	/**
	* The set value schema.
	*/
	readonly value: TValue$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function set<const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(value: TValue$1): SetSchema<TValue$1, undefined>;
declare function set<const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<SetIssue> | undefined>(value: TValue$1, message: TMessage): SetSchema<TValue$1, TMessage>;
//#endregion
//#region src/schemas/set/setAsync.d.ts
/**
* Set schema async interface.
*/
export interface SetSchemaAsync<TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<SetIssue> | undefined> extends BaseSchemaAsync<InferSetInput<TValue$1>, InferSetOutput<TValue$1>, SetIssue | InferIssue<TValue$1>> {
	/**
	* The schema type.
	*/
	readonly type: "set";
	/**
	* The schema reference.
	*/
	readonly reference: typeof set | typeof setAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Set";
	/**
	* The set value schema.
	*/
	readonly value: TValue$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function setAsync<const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(value: TValue$1): SetSchemaAsync<TValue$1, undefined>;
declare function setAsync<const TValue$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<SetIssue> | undefined>(value: TValue$1, message: TMessage): SetSchemaAsync<TValue$1, TMessage>;
//#endregion
//#region src/schemas/strictObject/types.d.ts
/**
* Strict object issue interface.
*/
export interface StrictObjectIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "strict_object";
	/**
	* The expected property.
	*/
	readonly expected: "Object" | `"${string}"` | "never";
}
//#endregion
//#region src/schemas/strictObject/strictObject.d.ts
/**
* Strict object schema interface.
*/
export interface StrictObjectSchema<TEntries$1 extends ObjectEntries, TMessage extends ErrorMessage<StrictObjectIssue> | undefined> extends BaseSchema<InferObjectInput<TEntries$1>, InferObjectOutput<TEntries$1>, StrictObjectIssue | InferObjectIssue<TEntries$1>> {
	/**
	* The schema type.
	*/
	readonly type: "strict_object";
	/**
	* The schema reference.
	*/
	readonly reference: typeof strictObject;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function strictObject<const TEntries$1 extends ObjectEntries>(entries: TEntries$1): StrictObjectSchema<TEntries$1, undefined>;
declare function strictObject<const TEntries$1 extends ObjectEntries, const TMessage extends ErrorMessage<StrictObjectIssue> | undefined>(entries: TEntries$1, message: TMessage): StrictObjectSchema<TEntries$1, TMessage>;
//#endregion
//#region src/schemas/strictObject/strictObjectAsync.d.ts
/**
* Strict object schema async interface.
*/
export interface StrictObjectSchemaAsync<TEntries$1 extends ObjectEntriesAsync, TMessage extends ErrorMessage<StrictObjectIssue> | undefined> extends BaseSchemaAsync<InferObjectInput<TEntries$1>, InferObjectOutput<TEntries$1>, StrictObjectIssue | InferObjectIssue<TEntries$1>> {
	/**
	* The schema type.
	*/
	readonly type: "strict_object";
	/**
	* The schema reference.
	*/
	readonly reference: typeof strictObject | typeof strictObjectAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The entries schema.
	*/
	readonly entries: TEntries$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function strictObjectAsync<const TEntries$1 extends ObjectEntriesAsync>(entries: TEntries$1): StrictObjectSchemaAsync<TEntries$1, undefined>;
declare function strictObjectAsync<const TEntries$1 extends ObjectEntriesAsync, const TMessage extends ErrorMessage<StrictObjectIssue> | undefined>(entries: TEntries$1, message: TMessage): StrictObjectSchemaAsync<TEntries$1, TMessage>;
//#endregion
//#region src/schemas/strictTuple/types.d.ts
/**
* Strict tuple issue interface.
*/
export interface StrictTupleIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "strict_tuple";
	/**
	* The expected property.
	*/
	readonly expected: "Array" | "never";
}
//#endregion
//#region src/schemas/strictTuple/strictTuple.d.ts
/**
* Strict tuple schema interface.
*/
export interface StrictTupleSchema<TItems$1 extends TupleItems, TMessage extends ErrorMessage<StrictTupleIssue> | undefined> extends BaseSchema<InferTupleInput<TItems$1>, InferTupleOutput<TItems$1>, StrictTupleIssue | InferTupleIssue<TItems$1>> {
	/**
	* The schema type.
	*/
	readonly type: "strict_tuple";
	/**
	* The schema reference.
	*/
	readonly reference: typeof strictTuple;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function strictTuple<const TItems$1 extends TupleItems>(items: TItems$1): StrictTupleSchema<TItems$1, undefined>;
declare function strictTuple<const TItems$1 extends TupleItems, const TMessage extends ErrorMessage<StrictTupleIssue> | undefined>(items: TItems$1, message: TMessage): StrictTupleSchema<TItems$1, TMessage>;
//#endregion
//#region src/schemas/strictTuple/strictTupleAsync.d.ts
/**
* Strict tuple schema async interface.
*/
export interface StrictTupleSchemaAsync<TItems$1 extends TupleItemsAsync, TMessage extends ErrorMessage<StrictTupleIssue> | undefined> extends BaseSchemaAsync<InferTupleInput<TItems$1>, InferTupleOutput<TItems$1>, StrictTupleIssue | InferTupleIssue<TItems$1>> {
	/**
	* The schema type.
	*/
	readonly type: "strict_tuple";
	/**
	* The schema reference.
	*/
	readonly reference: typeof strictTuple | typeof strictTupleAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function strictTupleAsync<const TItems$1 extends TupleItemsAsync>(items: TItems$1): StrictTupleSchemaAsync<TItems$1, undefined>;
declare function strictTupleAsync<const TItems$1 extends TupleItemsAsync, const TMessage extends ErrorMessage<StrictTupleIssue> | undefined>(items: TItems$1, message: TMessage): StrictTupleSchemaAsync<TItems$1, TMessage>;
//#endregion
//#region src/schemas/string/string.d.ts
/**
* String issue interface.
*/
export interface StringIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "string";
	/**
	* The expected property.
	*/
	readonly expected: "string";
}
/**
* String schema interface.
*/
export interface StringSchema<TMessage extends ErrorMessage<StringIssue> | undefined> extends BaseSchema<string, string, StringIssue> {
	/**
	* The schema type.
	*/
	readonly type: "string";
	/**
	* The schema reference.
	*/
	readonly reference: typeof string;
	/**
	* The expected property.
	*/
	readonly expects: "string";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function string(): StringSchema<undefined>;
declare function string<const TMessage extends ErrorMessage<StringIssue> | undefined>(message: TMessage): StringSchema<TMessage>;
//#endregion
//#region src/schemas/symbol/symbol.d.ts
/**
* Symbol issue interface.
*/
export interface SymbolIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "symbol";
	/**
	* The expected property.
	*/
	readonly expected: "symbol";
}
/**
* Symbol schema interface.
*/
export interface SymbolSchema<TMessage extends ErrorMessage<SymbolIssue> | undefined> extends BaseSchema<symbol, symbol, SymbolIssue> {
	/**
	* The schema type.
	*/
	readonly type: "symbol";
	/**
	* The schema reference.
	*/
	readonly reference: typeof symbol;
	/**
	* The expected property.
	*/
	readonly expects: "symbol";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function symbol(): SymbolSchema<undefined>;
declare function symbol<const TMessage extends ErrorMessage<SymbolIssue> | undefined>(message: TMessage): SymbolSchema<TMessage>;
//#endregion
//#region src/schemas/tuple/types.d.ts
/**
* Tuple issue interface.
*/
export interface TupleIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "tuple";
	/**
	* The expected property.
	*/
	readonly expected: "Array";
}
//#endregion
//#region src/schemas/tuple/tuple.d.ts
/**
* Tuple schema interface.
*/
export interface TupleSchema<TItems$1 extends TupleItems, TMessage extends ErrorMessage<TupleIssue> | undefined> extends BaseSchema<InferTupleInput<TItems$1>, InferTupleOutput<TItems$1>, TupleIssue | InferTupleIssue<TItems$1>> {
	/**
	* The schema type.
	*/
	readonly type: "tuple";
	/**
	* The schema reference.
	*/
	readonly reference: typeof tuple;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function tuple<const TItems$1 extends TupleItems>(items: TItems$1): TupleSchema<TItems$1, undefined>;
declare function tuple<const TItems$1 extends TupleItems, const TMessage extends ErrorMessage<TupleIssue> | undefined>(items: TItems$1, message: TMessage): TupleSchema<TItems$1, TMessage>;
//#endregion
//#region src/schemas/tuple/tupleAsync.d.ts
/**
* Tuple schema async interface.
*/
export interface TupleSchemaAsync<TItems$1 extends TupleItemsAsync, TMessage extends ErrorMessage<TupleIssue> | undefined> extends BaseSchemaAsync<InferTupleInput<TItems$1>, InferTupleOutput<TItems$1>, TupleIssue | InferTupleIssue<TItems$1>> {
	/**
	* The schema type.
	*/
	readonly type: "tuple";
	/**
	* The schema reference.
	*/
	readonly reference: typeof tuple | typeof tupleAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function tupleAsync<const TItems$1 extends TupleItemsAsync>(items: TItems$1): TupleSchemaAsync<TItems$1, undefined>;
declare function tupleAsync<const TItems$1 extends TupleItemsAsync, const TMessage extends ErrorMessage<TupleIssue> | undefined>(items: TItems$1, message: TMessage): TupleSchemaAsync<TItems$1, TMessage>;
//#endregion
//#region src/schemas/tupleWithRest/types.d.ts
/**
* Tuple with rest issue interface.
*/
export interface TupleWithRestIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "tuple_with_rest";
	/**
	* The expected property.
	*/
	readonly expected: "Array";
}
//#endregion
//#region src/schemas/tupleWithRest/tupleWithRest.d.ts
/**
* Tuple with rest schema interface.
*/
export interface TupleWithRestSchema<TItems$1 extends TupleItems, TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<TupleWithRestIssue> | undefined> extends BaseSchema<[
	...InferTupleInput<TItems$1>,
	...InferInput<TRest$1>[]
], [
	...InferTupleOutput<TItems$1>,
	...InferOutput<TRest$1>[]
], TupleWithRestIssue | InferTupleIssue<TItems$1> | InferIssue<TRest$1>> {
	/**
	* The schema type.
	*/
	readonly type: "tuple_with_rest";
	/**
	* The schema reference.
	*/
	readonly reference: typeof tupleWithRest;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The rest schema.
	*/
	readonly rest: TRest$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function tupleWithRest<const TItems$1 extends TupleItems, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(items: TItems$1, rest: TRest$1): TupleWithRestSchema<TItems$1, TRest$1, undefined>;
declare function tupleWithRest<const TItems$1 extends TupleItems, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<TupleWithRestIssue> | undefined>(items: TItems$1, rest: TRest$1, message: TMessage): TupleWithRestSchema<TItems$1, TRest$1, TMessage>;
//#endregion
//#region src/schemas/tupleWithRest/tupleWithRestAsync.d.ts
/**
* Tuple with rest schema async interface.
*/
export interface TupleWithRestSchemaAsync<TItems$1 extends TupleItemsAsync, TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TMessage extends ErrorMessage<TupleWithRestIssue> | undefined> extends BaseSchemaAsync<[
	...InferTupleInput<TItems$1>,
	...InferInput<TRest$1>[]
], [
	...InferTupleOutput<TItems$1>,
	...InferOutput<TRest$1>[]
], TupleWithRestIssue | InferTupleIssue<TItems$1> | InferIssue<TRest$1>> {
	/**
	* The schema type.
	*/
	readonly type: "tuple_with_rest";
	/**
	* The schema reference.
	*/
	readonly reference: typeof tupleWithRest | typeof tupleWithRestAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Array";
	/**
	* The items schema.
	*/
	readonly items: TItems$1;
	/**
	* The rest schema.
	*/
	readonly rest: TRest$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function tupleWithRestAsync<const TItems$1 extends TupleItemsAsync, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(items: TItems$1, rest: TRest$1): TupleWithRestSchemaAsync<TItems$1, TRest$1, undefined>;
declare function tupleWithRestAsync<const TItems$1 extends TupleItemsAsync, const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TMessage extends ErrorMessage<TupleWithRestIssue> | undefined>(items: TItems$1, rest: TRest$1, message: TMessage): TupleWithRestSchemaAsync<TItems$1, TRest$1, TMessage>;
//#endregion
//#region src/schemas/undefined/undefined.d.ts
/**
* Undefined issue interface.
*/
export interface UndefinedIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "undefined";
	/**
	* The expected property.
	*/
	readonly expected: "undefined";
}
/**
* Undefined schema interface.
*/
export interface UndefinedSchema<TMessage extends ErrorMessage<UndefinedIssue> | undefined> extends BaseSchema<undefined, undefined, UndefinedIssue> {
	/**
	* The schema type.
	*/
	readonly type: "undefined";
	/**
	* The schema reference.
	*/
	readonly reference: typeof undefined_;
	/**
	* The expected property.
	*/
	readonly expects: "undefined";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function undefined_(): UndefinedSchema<undefined>;
declare function undefined_<const TMessage extends ErrorMessage<UndefinedIssue> | undefined>(message: TMessage): UndefinedSchema<TMessage>;
//#endregion
//#region src/schemas/undefinedable/types.d.ts
/**
* Infer undefinedable output type.
*/
export type InferUndefinedableOutput<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, undefined>> = undefined extends TDefault ? InferOutput<TWrapped$1> | undefined : InferOutput<TWrapped$1> | Extract<DefaultValue<TDefault>, undefined>;
//#endregion
//#region src/schemas/undefinedable/undefinedable.d.ts
/**
* Undefinedable schema interface.
*/
export interface UndefinedableSchema<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, TDefault extends Default<TWrapped$1, undefined>> extends BaseSchema<InferInput<TWrapped$1> | undefined, InferUndefinedableOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "undefinedable";
	/**
	* The schema reference.
	*/
	readonly reference: typeof undefinedable;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | undefined)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function undefinedable<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): UndefinedableSchema<TWrapped$1, undefined>;
declare function undefinedable<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>, const TDefault extends Default<TWrapped$1, undefined>>(wrapped: TWrapped$1, default_: TDefault): UndefinedableSchema<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/undefinedable/undefinedableAsync.d.ts
/**
* Undefinedable schema async interface.
*/
export interface UndefinedableSchemaAsync<TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, TDefault extends DefaultAsync<TWrapped$1, undefined>> extends BaseSchemaAsync<InferInput<TWrapped$1> | undefined, InferUndefinedableOutput<TWrapped$1, TDefault>, InferIssue<TWrapped$1>> {
	/**
	* The schema type.
	*/
	readonly type: "undefinedable";
	/**
	* The schema reference.
	*/
	readonly reference: typeof undefinedable | typeof undefinedableAsync;
	/**
	* The expected property.
	*/
	readonly expects: `(${TWrapped$1["expects"]} | undefined)`;
	/**
	* The wrapped schema.
	*/
	readonly wrapped: TWrapped$1;
	/**
	* The default value.
	*/
	readonly default: TDefault;
}
declare function undefinedableAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(wrapped: TWrapped$1): UndefinedableSchemaAsync<TWrapped$1, undefined>;
declare function undefinedableAsync<const TWrapped$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, const TDefault extends DefaultAsync<TWrapped$1, undefined>>(wrapped: TWrapped$1, default_: TDefault): UndefinedableSchemaAsync<TWrapped$1, TDefault>;
//#endregion
//#region src/schemas/unknown/unknown.d.ts
/**
* Unknown schema interface.
*/
export interface UnknownSchema extends BaseSchema<unknown, unknown, never> {
	/**
	* The schema type.
	*/
	readonly type: "unknown";
	/**
	* The schema reference.
	*/
	readonly reference: typeof unknown;
	/**
	* The expected property.
	*/
	readonly expects: "unknown";
}
declare function unknown(): UnknownSchema;
//#endregion
//#region src/schemas/variant/variant.d.ts
/**
* Variant schema interface.
*/
export interface VariantSchema<TKey$1 extends string, TOptions$1 extends VariantOptions<TKey$1>, TMessage extends ErrorMessage<VariantIssue> | undefined> extends BaseSchema<InferInput<TOptions$1[number]>, InferOutput<TOptions$1[number]>, VariantIssue | InferVariantIssue<TOptions$1>> {
	/**
	* The schema type.
	*/
	readonly type: "variant";
	/**
	* The schema reference.
	*/
	readonly reference: typeof variant;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The discriminator key.
	*/
	readonly key: TKey$1;
	/**
	* The variant options.
	*/
	readonly options: TOptions$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function variant<const TKey$1 extends string, const TOptions$1 extends VariantOptions<TKey$1>>(key: TKey$1, options: TOptions$1): VariantSchema<TKey$1, TOptions$1, undefined>;
declare function variant<const TKey$1 extends string, const TOptions$1 extends VariantOptions<TKey$1>, const TMessage extends ErrorMessage<VariantIssue> | undefined>(key: TKey$1, options: TOptions$1, message: TMessage): VariantSchema<TKey$1, TOptions$1, TMessage>;
//#endregion
//#region src/schemas/variant/variantAsync.d.ts
/**
* Variant schema async interface.
*/
export interface VariantSchemaAsync<TKey$1 extends string, TOptions$1 extends VariantOptionsAsync<TKey$1>, TMessage extends ErrorMessage<VariantIssue> | undefined> extends BaseSchemaAsync<InferInput<TOptions$1[number]>, InferOutput<TOptions$1[number]>, VariantIssue | InferVariantIssue<TOptions$1>> {
	/**
	* The schema type.
	*/
	readonly type: "variant";
	/**
	* The schema reference.
	*/
	readonly reference: typeof variant | typeof variantAsync;
	/**
	* The expected property.
	*/
	readonly expects: "Object";
	/**
	* The discriminator key.
	*/
	readonly key: TKey$1;
	/**
	* The variant options.
	*/
	readonly options: TOptions$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function variantAsync<const TKey$1 extends string, const TOptions$1 extends VariantOptionsAsync<TKey$1>>(key: TKey$1, options: TOptions$1): VariantSchemaAsync<TKey$1, TOptions$1, undefined>;
declare function variantAsync<const TKey$1 extends string, const TOptions$1 extends VariantOptionsAsync<TKey$1>, const TMessage extends ErrorMessage<VariantIssue> | undefined>(key: TKey$1, options: TOptions$1, message: TMessage): VariantSchemaAsync<TKey$1, TOptions$1, TMessage>;
//#endregion
//#region src/schemas/variant/types.d.ts
/**
* Variant issue interface.
*/
export interface VariantIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "variant";
	/**
	* The expected property.
	*/
	readonly expected: string;
}
/**
* Variant option schema interface.
*/
export interface VariantOptionSchema<TKey$1 extends string> extends BaseSchema<unknown, unknown, VariantIssue | BaseIssue<unknown>> {
	readonly type: "variant";
	readonly reference: typeof variant;
	readonly key: string;
	readonly options: VariantOptions<TKey$1>;
	readonly message: ErrorMessage<VariantIssue> | undefined;
}
/**
* Variant option schema async interface.
*/
export interface VariantOptionSchemaAsync<TKey$1 extends string> extends BaseSchemaAsync<unknown, unknown, VariantIssue | BaseIssue<unknown>> {
	readonly type: "variant";
	readonly reference: typeof variant | typeof variantAsync;
	readonly key: string;
	readonly options: VariantOptionsAsync<TKey$1>;
	readonly message: ErrorMessage<VariantIssue> | undefined;
}
/**
* Variant object entries type.
*/
export type VariantObjectEntries<TKey$1 extends string> = Record<TKey$1, BaseSchema<unknown, unknown, BaseIssue<unknown>> | OptionalEntrySchema> & ObjectEntries;
/**
* Variant object entries async type.
*/
export type VariantObjectEntriesAsync<TKey$1 extends string> = Record<TKey$1, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | OptionalEntrySchema | OptionalEntrySchemaAsync> & ObjectEntriesAsync;
/**
* Variant option type.
*/
export type VariantOption<TKey$1 extends string> = LooseObjectSchema<VariantObjectEntries<TKey$1>, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<VariantObjectEntries<TKey$1>, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<VariantObjectEntries<TKey$1>, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<VariantObjectEntries<TKey$1>, ErrorMessage<StrictObjectIssue> | undefined> | VariantOptionSchema<TKey$1>;
/**
* Variant option async type.
*/
export type VariantOptionAsync<TKey$1 extends string> = LooseObjectSchemaAsync<VariantObjectEntriesAsync<TKey$1>, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchemaAsync<VariantObjectEntriesAsync<TKey$1>, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchemaAsync<VariantObjectEntriesAsync<TKey$1>, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchemaAsync<VariantObjectEntriesAsync<TKey$1>, ErrorMessage<StrictObjectIssue> | undefined> | VariantOptionSchemaAsync<TKey$1>;
/**
* Variant options type.
*/
export type VariantOptions<TKey$1 extends string> = MaybeReadonly<VariantOption<TKey$1>[]>;
/**
* Variant options async type.
*/
export type VariantOptionsAsync<TKey$1 extends string> = MaybeReadonly<(VariantOption<TKey$1> | VariantOptionAsync<TKey$1>)[]>;
/**
* Infer variant issue type.
*/
export type InferVariantIssue<TOptions$1 extends VariantOptions<string> | VariantOptionsAsync<string>> = Exclude<InferIssue<TOptions$1[number]>, {
	type: "loose_object" | "object" | "object_with_rest";
}>;
//#endregion
//#region src/schemas/void/void.d.ts
/**
* Void issue interface.
*/
export interface VoidIssue extends BaseIssue<unknown> {
	/**
	* The issue kind.
	*/
	readonly kind: "schema";
	/**
	* The issue type.
	*/
	readonly type: "void";
	/**
	* The expected property.
	*/
	readonly expected: "void";
}
/**
* Void schema interface.
*/
export interface VoidSchema<TMessage extends ErrorMessage<VoidIssue> | undefined> extends BaseSchema<void, void, VoidIssue> {
	/**
	* The schema type.
	*/
	readonly type: "void";
	/**
	* The schema reference.
	*/
	readonly reference: typeof void_;
	/**
	* The expected property.
	*/
	readonly expects: "void";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function void_(): VoidSchema<undefined>;
declare function void_<const TMessage extends ErrorMessage<VoidIssue> | undefined>(message: TMessage): VoidSchema<TMessage>;
//#endregion
//#region src/actions/args/args.d.ts
/**
* Schema type.
*/
export type Schema$3 = LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<TupleItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined>;
/**
* Args action type.
*/
export interface ArgsAction<TInput$1 extends (...args: any[]) => unknown, TSchema extends Schema$3> extends BaseTransformation<TInput$1, (...args: InferInput<TSchema>) => ReturnType<TInput$1>, never> {
	/**
	* The action type.
	*/
	readonly type: "args";
	/**
	* The action reference.
	*/
	readonly reference: typeof args;
	/**
	* The arguments schema.
	*/
	readonly schema: TSchema;
}
declare function args<TInput$1 extends (...args: any[]) => unknown, TSchema extends Schema$3>(schema: TSchema): ArgsAction<TInput$1, TSchema>;
//#endregion
//#region src/actions/args/argsAsync.d.ts
/**
* Schema type.
*/
export type Schema$2 = LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> | LooseTupleSchemaAsync<TupleItemsAsync, ErrorMessage<LooseTupleIssue> | undefined> | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined> | StrictTupleSchemaAsync<TupleItemsAsync, ErrorMessage<StrictTupleIssue> | undefined> | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> | TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined> | TupleWithRestSchema<TupleItems, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined> | TupleWithRestSchemaAsync<TupleItemsAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<TupleWithRestIssue> | undefined>;
/**
* Args action async type.
*/
export interface ArgsActionAsync<TInput$1 extends (...args: any[]) => unknown, TSchema extends Schema$2> extends BaseTransformation<TInput$1, (...args: InferInput<TSchema>) => Promise<Awaited<ReturnType<TInput$1>>>, never> {
	/**
	* The action type.
	*/
	readonly type: "args";
	/**
	* The action reference.
	*/
	readonly reference: typeof argsAsync;
	/**
	* The arguments schema.
	*/
	readonly schema: TSchema;
}
declare function argsAsync<TInput$1 extends (...args: any[]) => unknown, TSchema extends Schema$2>(schema: TSchema): ArgsActionAsync<TInput$1, TSchema>;
//#endregion
//#region src/actions/await/awaitAsync.d.ts
/**
* Await action async interface.
*/
export interface AwaitActionAsync<TInput$1 extends Promise<unknown>> extends BaseTransformationAsync<TInput$1, Awaited<TInput$1>, never> {
	/**
	* The action type.
	*/
	readonly type: "await";
	/**
	* The action reference.
	*/
	readonly reference: typeof awaitAsync;
}
declare function awaitAsync<TInput$1 extends Promise<unknown>>(): AwaitActionAsync<TInput$1>;
//#endregion
//#region src/actions/base64/base64.d.ts
/**
* Base64 issue interface.
*/
export interface Base64Issue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "base64";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The Base64 regex.
	*/
	readonly requirement: RegExp;
}
/**
* Base64 action interface.
*/
export interface Base64Action<TInput$1 extends string, TMessage extends ErrorMessage<Base64Issue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, Base64Issue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "base64";
	/**
	* The action reference.
	*/
	readonly reference: typeof base64;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The Base64 regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function base64<TInput$1 extends string>(): Base64Action<TInput$1, undefined>;
declare function base64<TInput$1 extends string, const TMessage extends ErrorMessage<Base64Issue<TInput$1>> | undefined>(message: TMessage): Base64Action<TInput$1, TMessage>;
//#endregion
//#region src/actions/bic/bic.d.ts
/**
* BIC issue interface.
*/
export interface BicIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "bic";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The BIC regex.
	*/
	readonly requirement: RegExp;
}
/**
* BIC action interface.
*/
export interface BicAction<TInput$1 extends string, TMessage extends ErrorMessage<BicIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, BicIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "bic";
	/**
	* The action reference.
	*/
	readonly reference: typeof bic;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The BIC regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function bic<TInput$1 extends string>(): BicAction<TInput$1, undefined>;
declare function bic<TInput$1 extends string, const TMessage extends ErrorMessage<BicIssue<TInput$1>> | undefined>(message: TMessage): BicAction<TInput$1, TMessage>;
declare const BrandSymbol: unique symbol;
/**
* Brand name type.
*/
export type BrandName = string | number | symbol;
/**
* Brand interface.
*/
export interface Brand<TName extends BrandName> {
	[BrandSymbol]: {
		[TValue in TName]: TValue;
	};
}
/**
* Brand action interface.
*/
export interface BrandAction<TInput$1, TName extends BrandName> extends BaseTransformation<TInput$1, TInput$1 & Brand<TName>, never> {
	/**
	* The action type.
	*/
	readonly type: "brand";
	/**
	* The action reference.
	*/
	readonly reference: typeof brand;
	/**
	* The brand name.
	*/
	readonly name: TName;
}
declare function brand<TInput$1, TName extends BrandName>(name: TName): BrandAction<TInput$1, TName>;
//#endregion
//#region src/actions/bytes/bytes.d.ts
/**
* Bytes issue interface.
*/
export interface BytesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "bytes";
	/**
	* The expected property.
	*/
	readonly expected: `${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The required bytes.
	*/
	readonly requirement: TRequirement;
}
/**
* Bytes action interface.
*/
export interface BytesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<BytesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, BytesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "bytes";
	/**
	* The action reference.
	*/
	readonly reference: typeof bytes;
	/**
	* The expected property.
	*/
	readonly expects: `${TRequirement}`;
	/**
	* The required bytes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function bytes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): BytesAction<TInput$1, TRequirement, undefined>;
declare function bytes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<BytesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): BytesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/check/types.d.ts
/**
* Check issue interface.
*/
export interface CheckIssue<TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "check";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: TInput$1) => MaybePromise<boolean>;
}
//#endregion
//#region src/actions/check/check.d.ts
/**
* Check action interface.
*/
export interface CheckAction<TInput$1, TMessage extends ErrorMessage<CheckIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, CheckIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "check";
	/**
	* The action reference.
	*/
	readonly reference: typeof check;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: TInput$1) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function check<TInput$1>(requirement: (input: TInput$1) => boolean): CheckAction<TInput$1, undefined>;
declare function check<TInput$1, const TMessage extends ErrorMessage<CheckIssue<TInput$1>> | undefined>(requirement: (input: TInput$1) => boolean, message: TMessage): CheckAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/check/checkAsync.d.ts
/**
* Check action async interface.
*/
export interface CheckActionAsync<TInput$1, TMessage extends ErrorMessage<CheckIssue<TInput$1>> | undefined> extends BaseValidationAsync<TInput$1, TInput$1, CheckIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "check";
	/**
	* The action reference.
	*/
	readonly reference: typeof checkAsync;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: TInput$1) => MaybePromise<boolean>;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function checkAsync<TInput$1>(requirement: (input: TInput$1) => MaybePromise<boolean>): CheckActionAsync<TInput$1, undefined>;
declare function checkAsync<TInput$1, const TMessage extends ErrorMessage<CheckIssue<TInput$1>> | undefined>(requirement: (input: TInput$1) => MaybePromise<boolean>, message: TMessage): CheckActionAsync<TInput$1, TMessage>;
//#endregion
//#region src/actions/types.d.ts
/**
* Array input type.
*/
export type ArrayInput = MaybeReadonly<unknown[]>;
/**
* Array requirement type.
*/
export type ArrayRequirement<TInput$1 extends ArrayInput> = (item: TInput$1[number], index: number, array: TInput$1) => boolean;
/**
* Array requirement async type.
*/
export type ArrayRequirementAsync<TInput$1 extends ArrayInput> = (item: TInput$1[number], index: number, array: TInput$1) => MaybePromise<boolean>;
/**
* Content input type.
*/
export type ContentInput = string | MaybeReadonly<unknown[]>;
/**
* Content requirement type.
*/
export type ContentRequirement<TInput$1 extends ContentInput> = TInput$1 extends readonly unknown[] ? TInput$1[number] : TInput$1;
/**
* Entries input type.
*/
export type EntriesInput = Record<string | number, unknown>;
/**
* Length input type.
*/
export type LengthInput = string | ArrayLike<unknown>;
/**
* Size input type.
*/
export type SizeInput = Blob | Map<unknown, unknown> | Set<unknown>;
/**
* Value input type.
*/
export type ValueInput = string | number | bigint | boolean | Date;
//#endregion
//#region src/actions/checkItems/types.d.ts
/**
* Check items issue interface.
*/
export interface CheckItemsIssue<TInput$1 extends ArrayInput> extends BaseIssue<TInput$1[number]> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "check_items";
	/**
	* The expected input.
	*/
	readonly expected: null;
	/**
	* The validation function.
	*/
	readonly requirement: ArrayRequirementAsync<TInput$1>;
}
//#endregion
//#region src/actions/checkItems/checkItems.d.ts
/**
* Check items action interface.
*/
export interface CheckItemsAction<TInput$1 extends ArrayInput, TMessage extends ErrorMessage<CheckItemsIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, CheckItemsIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "check_items";
	/**
	* The action reference.
	*/
	readonly reference: typeof checkItems;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: ArrayRequirement<TInput$1>;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function checkItems<TInput$1 extends ArrayInput>(requirement: ArrayRequirement<TInput$1>): CheckItemsAction<TInput$1, undefined>;
declare function checkItems<TInput$1 extends ArrayInput, const TMessage extends ErrorMessage<CheckItemsIssue<TInput$1>> | undefined>(requirement: ArrayRequirement<TInput$1>, message: TMessage): CheckItemsAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/checkItems/checkItemsAsync.d.ts
/**
* Check items action async interface.
*/
export interface CheckItemsActionAsync<TInput$1 extends ArrayInput, TMessage extends ErrorMessage<CheckItemsIssue<TInput$1>> | undefined> extends BaseValidationAsync<TInput$1, TInput$1, CheckItemsIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "check_items";
	/**
	* The action reference.
	*/
	readonly reference: typeof checkItemsAsync;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: ArrayRequirementAsync<TInput$1>;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function checkItemsAsync<TInput$1 extends ArrayInput>(requirement: ArrayRequirementAsync<TInput$1>): CheckItemsActionAsync<TInput$1, undefined>;
declare function checkItemsAsync<TInput$1 extends ArrayInput, const TMessage extends ErrorMessage<CheckItemsIssue<TInput$1>> | undefined>(requirement: ArrayRequirementAsync<TInput$1>, message: TMessage): CheckItemsActionAsync<TInput$1, TMessage>;
//#endregion
//#region src/actions/creditCard/creditCard.d.ts
/**
* Credit card issue interface.
*/
export interface CreditCardIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "credit_card";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
}
/**
* Credit card action interface.
*/
export interface CreditCardAction<TInput$1 extends string, TMessage extends ErrorMessage<CreditCardIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, CreditCardIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "credit_card";
	/**
	* The action reference.
	*/
	readonly reference: typeof creditCard;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function creditCard<TInput$1 extends string>(): CreditCardAction<TInput$1, undefined>;
declare function creditCard<TInput$1 extends string, const TMessage extends ErrorMessage<CreditCardIssue<TInput$1>> | undefined>(message: TMessage): CreditCardAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/cuid2/cuid2.d.ts
/**
* Cuid2 issue interface.
*/
export interface Cuid2Issue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "cuid2";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The Cuid2 regex.
	*/
	readonly requirement: RegExp;
}
/**
* Cuid2 action interface.
*/
export interface Cuid2Action<TInput$1 extends string, TMessage extends ErrorMessage<Cuid2Issue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, Cuid2Issue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "cuid2";
	/**
	* The action reference.
	*/
	readonly reference: typeof cuid2;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The Cuid2 regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function cuid2<TInput$1 extends string>(): Cuid2Action<TInput$1, undefined>;
declare function cuid2<TInput$1 extends string, const TMessage extends ErrorMessage<Cuid2Issue<TInput$1>> | undefined>(message: TMessage): Cuid2Action<TInput$1, TMessage>;
//#endregion
//#region src/actions/decimal/decimal.d.ts
/**
* Decimal issue interface.
*/
export interface DecimalIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "decimal";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The decimal regex.
	*/
	readonly requirement: RegExp;
}
/**
* Decimal action interface.
*/
export interface DecimalAction<TInput$1 extends string, TMessage extends ErrorMessage<DecimalIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, DecimalIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "decimal";
	/**
	* The action reference.
	*/
	readonly reference: typeof decimal;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The decimal regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function decimal<TInput$1 extends string>(): DecimalAction<TInput$1, undefined>;
declare function decimal<TInput$1 extends string, const TMessage extends ErrorMessage<DecimalIssue<TInput$1>> | undefined>(message: TMessage): DecimalAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/description/description.d.ts
/**
* Description action interface.
*/
export interface DescriptionAction<TInput$1, TDescription extends string> extends BaseMetadata<TInput$1> {
	/**
	* The action type.
	*/
	readonly type: "description";
	/**
	* The action reference.
	*/
	readonly reference: typeof description;
	/**
	* The description text.
	*/
	readonly description: TDescription;
}
declare function description<TInput$1, TDescription extends string>(description_: TDescription): DescriptionAction<TInput$1, TDescription>;
//#endregion
//#region src/actions/digits/digits.d.ts
/**
* Digits issue interface.
*/
export interface DigitsIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "digits";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The digits regex.
	*/
	readonly requirement: RegExp;
}
/**
* Digits action interface.
*/
export interface DigitsAction<TInput$1 extends string, TMessage extends ErrorMessage<DigitsIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, DigitsIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "digits";
	/**
	* The action reference.
	*/
	readonly reference: typeof digits;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The digits regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function digits<TInput$1 extends string>(): DigitsAction<TInput$1, undefined>;
declare function digits<TInput$1 extends string, const TMessage extends ErrorMessage<DigitsIssue<TInput$1>> | undefined>(message: TMessage): DigitsAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/domain/domain.d.ts
/**
* Domain issue interface.
*
* @beta
*/
export interface DomainIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "domain";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The domain regex.
	*/
	readonly requirement: RegExp;
}
/**
* Domain action interface.
*
* @beta
*/
export interface DomainAction<TInput$1 extends string, TMessage extends ErrorMessage<DomainIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, DomainIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "domain";
	/**
	* The action reference.
	*/
	readonly reference: typeof domain;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The domain regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function domain<TInput$1 extends string>(): DomainAction<TInput$1, undefined>;
declare function domain<TInput$1 extends string, const TMessage extends ErrorMessage<DomainIssue<TInput$1>> | undefined>(message: TMessage): DomainAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/email/email.d.ts
/**
* Email issue interface.
*/
export interface EmailIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "email";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The email regex.
	*/
	readonly requirement: RegExp;
}
/**
* Email action interface.
*/
export interface EmailAction<TInput$1 extends string, TMessage extends ErrorMessage<EmailIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, EmailIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "email";
	/**
	* The action reference.
	*/
	readonly reference: typeof email;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The email regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function email<TInput$1 extends string>(): EmailAction<TInput$1, undefined>;
declare function email<TInput$1 extends string, const TMessage extends ErrorMessage<EmailIssue<TInput$1>> | undefined>(message: TMessage): EmailAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/emoji/emoji.d.ts
/**
* Emoji issue interface.
*/
export interface EmojiIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "emoji";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The emoji regex.
	*/
	readonly requirement: RegExp;
}
/**
* Emoji action interface.
*/
export interface EmojiAction<TInput$1 extends string, TMessage extends ErrorMessage<EmojiIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, EmojiIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "emoji";
	/**
	* The action reference.
	*/
	readonly reference: typeof emoji;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The emoji regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function emoji<TInput$1 extends string>(): EmojiAction<TInput$1, undefined>;
declare function emoji<TInput$1 extends string, const TMessage extends ErrorMessage<EmojiIssue<TInput$1>> | undefined>(message: TMessage): EmojiAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/empty/empty.d.ts
/**
* Empty issue interface.
*/
export interface EmptyIssue<TInput$1 extends LengthInput> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "empty";
	/**
	* The expected input.
	*/
	readonly expected: "0";
	/**
	* The received input.
	*/
	readonly received: `${number}`;
}
/**
* Empty action interface.
*/
export interface EmptyAction<TInput$1 extends LengthInput, TMessage extends ErrorMessage<EmptyIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, EmptyIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "empty";
	/**
	* The action reference.
	*/
	readonly reference: typeof empty;
	/**
	* The expected property.
	*/
	readonly expects: "0";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function empty<TInput$1 extends LengthInput>(): EmptyAction<TInput$1, undefined>;
declare function empty<TInput$1 extends LengthInput, const TMessage extends ErrorMessage<EmptyIssue<TInput$1>> | undefined>(message: TMessage): EmptyAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/endsWith/endsWith.d.ts
/**
* Ends with issue interface.
*/
export interface EndsWithIssue<TInput$1 extends string, TRequirement extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "ends_with";
	/**
	* The expected property.
	*/
	readonly expected: `"${TRequirement}"`;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The end string.
	*/
	readonly requirement: TRequirement;
}
/**
* Ends with action interface.
*/
export interface EndsWithAction<TInput$1 extends string, TRequirement extends string, TMessage extends ErrorMessage<EndsWithIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, EndsWithIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "ends_with";
	/**
	* The action reference.
	*/
	readonly reference: typeof endsWith;
	/**
	* The expected property.
	*/
	readonly expects: `"${TRequirement}"`;
	/**
	* The end string.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function endsWith<TInput$1 extends string, const TRequirement extends string>(requirement: TRequirement): EndsWithAction<TInput$1, TRequirement, undefined>;
declare function endsWith<TInput$1 extends string, const TRequirement extends string, const TMessage extends ErrorMessage<EndsWithIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): EndsWithAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/entries/entries.d.ts
/**
* Entries issue interface.
*
* @beta
*/
export interface EntriesIssue<TInput$1 extends EntriesInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "entries";
	/**
	* The expected property.
	*/
	readonly expected: `${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The required entries.
	*/
	readonly requirement: TRequirement;
}
/**
* Entries action interface.
*
* @beta
*/
export interface EntriesAction<TInput$1 extends EntriesInput, TRequirement extends number, TMessage extends ErrorMessage<EntriesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, EntriesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "entries";
	/**
	* The action reference.
	*/
	readonly reference: typeof entries;
	/**
	* The expected property.
	*/
	readonly expects: `${TRequirement}`;
	/**
	* The required entries.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function entries<TInput$1 extends EntriesInput, const TRequirement extends number>(requirement: TRequirement): EntriesAction<TInput$1, TRequirement, undefined>;
declare function entries<TInput$1 extends EntriesInput, const TRequirement extends number, const TMessage extends ErrorMessage<EntriesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): EntriesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/everyItem/everyItem.d.ts
/**
* Every item issue interface.
*/
export interface EveryItemIssue<TInput$1 extends ArrayInput> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "every_item";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The validation function.
	*/
	readonly requirement: ArrayRequirement<TInput$1>;
}
/**
* Every item action interface.
*/
export interface EveryItemAction<TInput$1 extends ArrayInput, TMessage extends ErrorMessage<EveryItemIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, EveryItemIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "every_item";
	/**
	* The action reference.
	*/
	readonly reference: typeof everyItem;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: ArrayRequirement<TInput$1>;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function everyItem<TInput$1 extends ArrayInput>(requirement: ArrayRequirement<TInput$1>): EveryItemAction<TInput$1, undefined>;
declare function everyItem<TInput$1 extends ArrayInput, const TMessage extends ErrorMessage<EveryItemIssue<TInput$1>> | undefined>(requirement: ArrayRequirement<TInput$1>, message: TMessage): EveryItemAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/examples/examples.d.ts
/**
* Examples action interface.
*/
export interface ExamplesAction<TInput$1, TExamples extends readonly TInput$1[]> extends BaseMetadata<TInput$1> {
	/**
	* The action type.
	*/
	readonly type: "examples";
	/**
	* The action reference.
	*/
	readonly reference: typeof examples;
	/**
	* The examples.
	*/
	readonly examples: TExamples;
}
declare function examples<TInput$1, const TExamples extends readonly TInput$1[]>(examples_: TExamples): ExamplesAction<TInput$1, TExamples>;
//#endregion
//#region src/actions/excludes/excludes.d.ts
/**
* Excludes issue interface.
*/
export interface ExcludesIssue<TInput$1 extends ContentInput, TRequirement extends ContentRequirement<TInput$1>> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "excludes";
	/**
	* The expected property.
	*/
	readonly expected: string;
	/**
	* The content to be excluded.
	*/
	readonly requirement: TRequirement;
}
/**
* Excludes action interface.
*/
export interface ExcludesAction<TInput$1 extends ContentInput, TRequirement extends ContentRequirement<TInput$1>, TMessage extends ErrorMessage<ExcludesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, ExcludesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "excludes";
	/**
	* The action reference.
	*/
	readonly reference: typeof excludes;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* The content to be excluded.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function excludes<TInput$1 extends ContentInput, const TRequirement extends ContentRequirement<TInput$1>>(requirement: TRequirement): ExcludesAction<TInput$1, TRequirement, undefined>;
declare function excludes<TInput$1 extends ContentInput, const TRequirement extends ContentRequirement<TInput$1>, const TMessage extends ErrorMessage<ExcludesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): ExcludesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/filterItems/filterItems.d.ts
/**
* Filter items action interface.
*/
export interface FilterItemsAction<TInput$1 extends ArrayInput> extends BaseTransformation<TInput$1, TInput$1, never> {
	/**
	* The action type.
	*/
	readonly type: "filter_items";
	/**
	* The action reference.
	*/
	readonly reference: typeof filterItems;
	/**
	* The filter items operation.
	*/
	readonly operation: ArrayRequirement<TInput$1>;
}
declare function filterItems<TInput$1 extends ArrayInput>(operation: ArrayRequirement<TInput$1>): FilterItemsAction<TInput$1>;
//#endregion
//#region src/actions/findItem/findItem.d.ts
/**
* Array requirement type.
*/
export type ArrayRequirement$1<TInput$1 extends ArrayInput, TOuput extends TInput$1[number]> = ((item: TInput$1[number], index: number, array: TInput$1) => item is TOuput) | ((item: TInput$1[number], index: number, array: TInput$1) => boolean);
/**
* Find item action interface.
*/
export interface FindItemAction<TInput$1 extends ArrayInput, TOuput extends TInput$1[number]> extends BaseTransformation<TInput$1, TOuput | undefined, never> {
	/**
	* The action type.
	*/
	readonly type: "find_item";
	/**
	* The action reference.
	*/
	readonly reference: typeof findItem;
	/**
	* The find item operation.
	*/
	readonly operation: ArrayRequirement$1<TInput$1, TOuput>;
}
declare function findItem<TInput$1 extends ArrayInput, TOuput extends TInput$1[number]>(operation: ArrayRequirement$1<TInput$1, TOuput>): FindItemAction<TInput$1, TOuput>;
//#endregion
//#region src/actions/finite/finite.d.ts
/**
* Finite issue interface.
*/
export interface FiniteIssue<TInput$1 extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "finite";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The validation function.
	*/
	readonly requirement: (input: number) => boolean;
}
/**
* Finite action interface.
*/
export interface FiniteAction<TInput$1 extends number, TMessage extends ErrorMessage<FiniteIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, FiniteIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "finite";
	/**
	* The action reference.
	*/
	readonly reference: typeof finite;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: number) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function finite<TInput$1 extends number>(): FiniteAction<TInput$1, undefined>;
declare function finite<TInput$1 extends number, const TMessage extends ErrorMessage<FiniteIssue<TInput$1>> | undefined>(message: TMessage): FiniteAction<TInput$1, TMessage>;
declare const FlavorSymbol: unique symbol;
/**
* Flavor name type.
*
* @beta
*/
export type FlavorName = string | number | symbol;
/**
* Flavor interface.
*
* @beta
*/
export interface Flavor<TName extends FlavorName> {
	[FlavorSymbol]?: {
		[TValue in TName]: TValue;
	};
}
/**
* Flavor action interface.
*
* @beta
*/
export interface FlavorAction<TInput$1, TName extends FlavorName> extends BaseTransformation<TInput$1, TInput$1 & Flavor<TName>, never> {
	/**
	* The action type.
	*/
	readonly type: "flavor";
	/**
	* The action reference.
	*/
	readonly reference: typeof flavor;
	/**
	* The flavor name.
	*/
	readonly name: TName;
}
declare function flavor<TInput$1, TName extends FlavorName>(name: TName): FlavorAction<TInput$1, TName>;
//#endregion
//#region src/actions/graphemes/graphemes.d.ts
/**
* Graphemes issue interface.
*/
export interface GraphemesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "graphemes";
	/**
	* The expected property.
	*/
	readonly expected: `${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The required graphemes.
	*/
	readonly requirement: TRequirement;
}
/**
* Graphemes action interface.
*/
export interface GraphemesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<GraphemesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, GraphemesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "graphemes";
	/**
	* The action reference.
	*/
	readonly reference: typeof graphemes;
	/**
	* The expected property.
	*/
	readonly expects: `${TRequirement}`;
	/**
	* The required graphemes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function graphemes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): GraphemesAction<TInput$1, TRequirement, undefined>;
declare function graphemes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<GraphemesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): GraphemesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/gtValue/gtValue.d.ts
/**
* Greater than value issue type.
*/
export interface GtValueIssue<TInput$1 extends ValueInput, TRequirement extends TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "gt_value";
	/**
	* The expected property.
	*/
	readonly expected: `>${string}`;
	/**
	* The greater than value.
	*/
	readonly requirement: TRequirement;
}
/**
* Greater than value action type.
*/
export interface GtValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1, TMessage extends ErrorMessage<GtValueIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, GtValueIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "gt_value";
	/**
	* The action reference.
	*/
	readonly reference: typeof gtValue;
	/**
	* The expected property.
	*/
	readonly expects: `>${string}`;
	/**
	* The greater than value.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function gtValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): GtValueAction<TInput$1, TRequirement, undefined>;
declare function gtValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1, const TMessage extends ErrorMessage<GtValueIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): GtValueAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/guard/guard.d.ts
/**
* Guard function type.
*
* @beta
*/
export type GuardFunction<TInput$1> = (input: TInput$1) => input is any;
/**
* Infer guard output type.
*
* @beta
*/
export type InferGuardOutput<TGuard extends GuardFunction<any>> = TGuard extends ((input: any) => input is infer TOutput) ? TOutput : unknown;
/**
* Guard issue interface.
*
* @beta
*/
export interface GuardIssue<TInput$1, TGuard extends GuardFunction<TInput$1>> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "guard";
	/**
	* The guard function.
	*/
	readonly requirement: TGuard;
}
/**
* Guard action interface.
*
* @beta
*/
export interface GuardAction<TInput$1, TGuard extends GuardFunction<TInput$1>, TMessage extends ErrorMessage<GuardIssue<TInput$1, TGuard>> | undefined> extends BaseTransformation<TInput$1, TInput$1 & InferGuardOutput<TGuard>, GuardIssue<TInput$1, TGuard>> {
	/**
	* The action type.
	*/
	readonly type: "guard";
	/**
	* The action reference.
	*/
	readonly reference: typeof guard;
	/**
	* The guard function.
	*/
	readonly requirement: TGuard;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function guard<TInput$1, const TGuard extends GuardFunction<TInput$1>>(requirement: TGuard): GuardAction<TInput$1, TGuard, undefined>;
declare function guard<const TGuard extends GuardFunction<any>>(requirement: TGuard): GuardAction<Parameters<TGuard>[0], TGuard, undefined>;
declare function guard<TInput$1, const TGuard extends GuardFunction<TInput$1>, const TMessage extends ErrorMessage<GuardIssue<TInput$1, TGuard>> | undefined>(requirement: TGuard, message: TMessage): GuardAction<TInput$1, TGuard, TMessage>;
declare function guard<const TGuard extends GuardFunction<any>, const TMessage extends ErrorMessage<GuardIssue<Parameters<TGuard>[0], TGuard>> | undefined>(requirement: TGuard, message: TMessage): GuardAction<Parameters<TGuard>[0], TGuard, TMessage>;
declare const HASH_LENGTHS: {
	readonly md4: 32;
	readonly md5: 32;
	readonly sha1: 40;
	readonly sha256: 64;
	readonly sha384: 96;
	readonly sha512: 128;
	readonly ripemd128: 32;
	readonly ripemd160: 40;
	readonly tiger128: 32;
	readonly tiger160: 40;
	readonly tiger192: 48;
	readonly crc32: 8;
	readonly crc32b: 8;
	readonly adler32: 8;
};
/**
* Hash type type.
*/
export type HashType = keyof typeof HASH_LENGTHS;
/**
* Hash issue interface.
*/
export interface HashIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "hash";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The hash regex.
	*/
	readonly requirement: RegExp;
}
/**
* Hash action interface.
*/
export interface HashAction<TInput$1 extends string, TMessage extends ErrorMessage<HashIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, HashIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "hash";
	/**
	* The action reference.
	*/
	readonly reference: typeof hash;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The hash regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function hash<TInput$1 extends string>(types: [
	HashType,
	...HashType[]
]): HashAction<TInput$1, undefined>;
declare function hash<TInput$1 extends string, const TMessage extends ErrorMessage<HashIssue<TInput$1>> | undefined>(types: [
	HashType,
	...HashType[]
], message: TMessage): HashAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/hexadecimal/hexadecimal.d.ts
/**
* Hexadecimal issue interface.
*/
export interface HexadecimalIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "hexadecimal";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The hexadecimal regex.
	*/
	readonly requirement: RegExp;
}
/**
* Hexadecimal action interface.
*/
export interface HexadecimalAction<TInput$1 extends string, TMessage extends ErrorMessage<HexadecimalIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, HexadecimalIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "hexadecimal";
	/**
	* The action reference.
	*/
	readonly reference: typeof hexadecimal;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The hexadecimal regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function hexadecimal<TInput$1 extends string>(): HexadecimalAction<TInput$1, undefined>;
declare function hexadecimal<TInput$1 extends string, const TMessage extends ErrorMessage<HexadecimalIssue<TInput$1>> | undefined>(message: TMessage): HexadecimalAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/hexColor/hexColor.d.ts
/**
* Hex color issue interface.
*/
export interface HexColorIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "hex_color";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The hex color regex.
	*/
	readonly requirement: RegExp;
}
/**
* Hex color action interface.
*/
export interface HexColorAction<TInput$1 extends string, TMessage extends ErrorMessage<HexColorIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, HexColorIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "hex_color";
	/**
	* The action reference.
	*/
	readonly reference: typeof hexColor;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The hex color regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function hexColor<TInput$1 extends string>(): HexColorAction<TInput$1, undefined>;
declare function hexColor<TInput$1 extends string, const TMessage extends ErrorMessage<HexColorIssue<TInput$1>> | undefined>(message: TMessage): HexColorAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/imei/imei.d.ts
/**
* IMEI issue interface.
*/
export interface ImeiIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "imei";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
}
/**
* IMEI action interface.
*/
export interface ImeiAction<TInput$1 extends string, TMessage extends ErrorMessage<ImeiIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, ImeiIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "imei";
	/**
	* The action reference.
	*/
	readonly reference: typeof imei;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function imei<TInput$1 extends string>(): ImeiAction<TInput$1, undefined>;
declare function imei<TInput$1 extends string, const TMessage extends ErrorMessage<ImeiIssue<TInput$1>> | undefined>(message: TMessage): ImeiAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/includes/includes.d.ts
/**
* Includes issue interface.
*/
export interface IncludesIssue<TInput$1 extends ContentInput, TRequirement extends ContentRequirement<TInput$1>> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "includes";
	/**
	* The expected property.
	*/
	readonly expected: string;
	/**
	* The content to be included.
	*/
	readonly requirement: TRequirement;
}
/**
* Includes action interface.
*/
export interface IncludesAction<TInput$1 extends ContentInput, TRequirement extends ContentRequirement<TInput$1>, TMessage extends ErrorMessage<IncludesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, IncludesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "includes";
	/**
	* The action reference.
	*/
	readonly reference: typeof includes;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* The content to be included.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function includes<TInput$1 extends ContentInput, const TRequirement extends ContentRequirement<TInput$1>>(requirement: TRequirement): IncludesAction<TInput$1, TRequirement, undefined>;
declare function includes<TInput$1 extends ContentInput, const TRequirement extends ContentRequirement<TInput$1>, const TMessage extends ErrorMessage<IncludesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): IncludesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/integer/integer.d.ts
/**
* Integer issue interface.
*/
export interface IntegerIssue<TInput$1 extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "integer";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The validation function.
	*/
	readonly requirement: (input: number) => boolean;
}
/**
* Integer action interface.
*/
export interface IntegerAction<TInput$1 extends number, TMessage extends ErrorMessage<IntegerIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IntegerIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "integer";
	/**
	* The action reference.
	*/
	readonly reference: typeof integer;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: number) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function integer<TInput$1 extends number>(): IntegerAction<TInput$1, undefined>;
declare function integer<TInput$1 extends number, const TMessage extends ErrorMessage<IntegerIssue<TInput$1>> | undefined>(message: TMessage): IntegerAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/ip/ip.d.ts
/**
* IP issue interface.
*/
export interface IpIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "ip";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The IP regex.
	*/
	readonly requirement: RegExp;
}
/**
* IP action interface.
*/
export interface IpAction<TInput$1 extends string, TMessage extends ErrorMessage<IpIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IpIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "ip";
	/**
	* The action reference.
	*/
	readonly reference: typeof ip;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The IP regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function ip<TInput$1 extends string>(): IpAction<TInput$1, undefined>;
declare function ip<TInput$1 extends string, const TMessage extends ErrorMessage<IpIssue<TInput$1>> | undefined>(message: TMessage): IpAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/ipv4/ipv4.d.ts
/**
* IPv4 issue interface.
*/
export interface Ipv4Issue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "ipv4";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The IPv4 regex.
	*/
	readonly requirement: RegExp;
}
/**
* IPv4 action interface.
*/
export interface Ipv4Action<TInput$1 extends string, TMessage extends ErrorMessage<Ipv4Issue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, Ipv4Issue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "ipv4";
	/**
	* The action reference.
	*/
	readonly reference: typeof ipv4;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The IPv4 regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function ipv4<TInput$1 extends string>(): Ipv4Action<TInput$1, undefined>;
declare function ipv4<TInput$1 extends string, const TMessage extends ErrorMessage<Ipv4Issue<TInput$1>> | undefined>(message: TMessage): Ipv4Action<TInput$1, TMessage>;
//#endregion
//#region src/actions/ipv6/ipv6.d.ts
/**
* IPv6 issue interface.
*/
export interface Ipv6Issue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "ipv6";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The IPv6 regex.
	*/
	readonly requirement: RegExp;
}
/**
* IPv6 action interface.
*/
export interface Ipv6Action<TInput$1 extends string, TMessage extends ErrorMessage<Ipv6Issue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, Ipv6Issue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "ipv6";
	/**
	* The action reference.
	*/
	readonly reference: typeof ipv6;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The IPv6 regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function ipv6<TInput$1 extends string>(): Ipv6Action<TInput$1, undefined>;
declare function ipv6<TInput$1 extends string, const TMessage extends ErrorMessage<Ipv6Issue<TInput$1>> | undefined>(message: TMessage): Ipv6Action<TInput$1, TMessage>;
//#endregion
//#region src/actions/isbn/isbn.d.ts
/**
* ISBN issue interface.
*/
export interface IsbnIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "isbn";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
}
/**
* ISBN action interface.
*/
export interface IsbnAction<TInput$1 extends string, TMessage extends ErrorMessage<IsbnIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsbnIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "isbn";
	/**
	* The action reference.
	*/
	readonly reference: typeof isbn;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isbn<TInput$1 extends string>(): IsbnAction<TInput$1, undefined>;
declare function isbn<TInput$1 extends string, const TMessage extends ErrorMessage<IsbnIssue<TInput$1>> | undefined>(message: TMessage): IsbnAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isrc/isrc.d.ts
/**
* ISRC issue interface.
*/
export interface IsrcIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "isrc";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISRC regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISRC action interface.
*/
export interface IsrcAction<TInput$1 extends string, TMessage extends ErrorMessage<IsrcIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsrcIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "isrc";
	/**
	* The action reference.
	*/
	readonly reference: typeof isrc;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISRC regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isrc<TInput$1 extends string>(): IsrcAction<TInput$1, undefined>;
declare function isrc<TInput$1 extends string, const TMessage extends ErrorMessage<IsrcIssue<TInput$1>> | undefined>(message: TMessage): IsrcAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isoDate/isoDate.d.ts
/**
* ISO date issue interface.
*/
export interface IsoDateIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "iso_date";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISO date regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISO date action interface.
*/
export interface IsoDateAction<TInput$1 extends string, TMessage extends ErrorMessage<IsoDateIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsoDateIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "iso_date";
	/**
	* The action reference.
	*/
	readonly reference: typeof isoDate;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISO date regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isoDate<TInput$1 extends string>(): IsoDateAction<TInput$1, undefined>;
declare function isoDate<TInput$1 extends string, const TMessage extends ErrorMessage<IsoDateIssue<TInput$1>> | undefined>(message: TMessage): IsoDateAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isoDateTime/isoDateTime.d.ts
/**
* ISO date time issue interface.
*/
export interface IsoDateTimeIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "iso_date_time";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISO date time regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISO date time action interface.
*/
export interface IsoDateTimeAction<TInput$1 extends string, TMessage extends ErrorMessage<IsoDateTimeIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsoDateTimeIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "iso_date_time";
	/**
	* The action reference.
	*/
	readonly reference: typeof isoDateTime;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISO date time regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isoDateTime<TInput$1 extends string>(): IsoDateTimeAction<TInput$1, undefined>;
declare function isoDateTime<TInput$1 extends string, const TMessage extends ErrorMessage<IsoDateTimeIssue<TInput$1>> | undefined>(message: TMessage): IsoDateTimeAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isoDateTimeSecond/isoDateTimeSecond.d.ts
/**
* ISO date time second issue interface.
*/
export interface IsoDateTimeSecondIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "iso_date_time_second";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISO date time with seconds regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISO date time second action interface.
*/
export interface IsoDateTimeSecondAction<TInput$1 extends string, TMessage extends ErrorMessage<IsoDateTimeSecondIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsoDateTimeSecondIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "iso_date_time_second";
	/**
	* The action reference.
	*/
	readonly reference: typeof isoDateTimeSecond;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISO date time with seconds regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isoDateTimeSecond<TInput$1 extends string>(): IsoDateTimeSecondAction<TInput$1, undefined>;
declare function isoDateTimeSecond<TInput$1 extends string, const TMessage extends ErrorMessage<IsoDateTimeSecondIssue<TInput$1>> | undefined>(message: TMessage): IsoDateTimeSecondAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isoTime/isoTime.d.ts
/**
* ISO time issue interface.
*/
export interface IsoTimeIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "iso_time";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISO time regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISO time action interface.
*/
export interface IsoTimeAction<TInput$1 extends string, TMessage extends ErrorMessage<IsoTimeIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsoTimeIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "iso_time";
	/**
	* The action reference.
	*/
	readonly reference: typeof isoTime;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISO time regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isoTime<TInput$1 extends string>(): IsoTimeAction<TInput$1, undefined>;
declare function isoTime<TInput$1 extends string, const TMessage extends ErrorMessage<IsoTimeIssue<TInput$1>> | undefined>(message: TMessage): IsoTimeAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isoTimeSecond/isoTimeSecond.d.ts
/**
* ISO time second issue interface.
*/
export interface IsoTimeSecondIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "iso_time_second";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISO time with seconds regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISO time second action interface.
*/
export interface IsoTimeSecondAction<TInput$1 extends string, TMessage extends ErrorMessage<IsoTimeSecondIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsoTimeSecondIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "iso_time_second";
	/**
	* The action reference.
	*/
	readonly reference: typeof isoTimeSecond;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISO time second regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isoTimeSecond<TInput$1 extends string>(): IsoTimeSecondAction<TInput$1, undefined>;
declare function isoTimeSecond<TInput$1 extends string, const TMessage extends ErrorMessage<IsoTimeSecondIssue<TInput$1>> | undefined>(message: TMessage): IsoTimeSecondAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isoTimestamp/isoTimestamp.d.ts
/**
* ISO timestamp issue interface.
*/
export interface IsoTimestampIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "iso_timestamp";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISO timestamp regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISO timestamp action interface.
*/
export interface IsoTimestampAction<TInput$1 extends string, TMessage extends ErrorMessage<IsoTimestampIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsoTimestampIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "iso_timestamp";
	/**
	* The action reference.
	*/
	readonly reference: typeof isoTimestamp;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISO timestamp regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isoTimestamp<TInput$1 extends string>(): IsoTimestampAction<TInput$1, undefined>;
declare function isoTimestamp<TInput$1 extends string, const TMessage extends ErrorMessage<IsoTimestampIssue<TInput$1>> | undefined>(message: TMessage): IsoTimestampAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/isoWeek/isoWeek.d.ts
/**
* ISO week issue interface.
*/
export interface IsoWeekIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "iso_week";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ISO week regex.
	*/
	readonly requirement: RegExp;
}
/**
* ISO week action interface.
*/
export interface IsoWeekAction<TInput$1 extends string, TMessage extends ErrorMessage<IsoWeekIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, IsoWeekIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "iso_week";
	/**
	* The action reference.
	*/
	readonly reference: typeof isoWeek;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ISO week regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function isoWeek<TInput$1 extends string>(): IsoWeekAction<TInput$1, undefined>;
declare function isoWeek<TInput$1 extends string, const TMessage extends ErrorMessage<IsoWeekIssue<TInput$1>> | undefined>(message: TMessage): IsoWeekAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/jwsCompact/jwsCompact.d.ts
/**
* JWS compact issue interface.
*
* @beta
*/
export interface JwsCompactIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "jws_compact";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The JWS compact regex.
	*/
	readonly requirement: RegExp;
}
/**
* JWS compact action interface.
*
* @beta
*/
export interface JwsCompactAction<TInput$1 extends string, TMessage extends ErrorMessage<JwsCompactIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, JwsCompactIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "jws_compact";
	/**
	* The action reference.
	*/
	readonly reference: typeof jwsCompact;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The JWS compact regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function jwsCompact<TInput$1 extends string>(): JwsCompactAction<TInput$1, undefined>;
declare function jwsCompact<TInput$1 extends string, const TMessage extends ErrorMessage<JwsCompactIssue<TInput$1>> | undefined>(message: TMessage): JwsCompactAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/length/length.d.ts
/**
* Length issue interface.
*/
export interface LengthIssue<TInput$1 extends LengthInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "length";
	/**
	* The expected property.
	*/
	readonly expected: `${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The required length.
	*/
	readonly requirement: TRequirement;
}
/**
* Length action interface.
*/
export interface LengthAction<TInput$1 extends LengthInput, TRequirement extends number, TMessage extends ErrorMessage<LengthIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, LengthIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "length";
	/**
	* The action reference.
	*/
	readonly reference: typeof length$1;
	/**
	* The expected property.
	*/
	readonly expects: `${TRequirement}`;
	/**
	* The required length.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function length$1<TInput$1 extends LengthInput, const TRequirement extends number>(requirement: TRequirement): LengthAction<TInput$1, TRequirement, undefined>;
declare function length$1<TInput$1 extends LengthInput, const TRequirement extends number, const TMessage extends ErrorMessage<LengthIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): LengthAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/ltValue/ltValue.d.ts
/**
* Less than value issue type.
*/
export interface LtValueIssue<TInput$1 extends ValueInput, TRequirement extends TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "lt_value";
	/**
	* The expected property.
	*/
	readonly expected: `<${string}`;
	/**
	* The less than value.
	*/
	readonly requirement: TRequirement;
}
/**
* Less than value action type.
*/
export interface LtValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1, TMessage extends ErrorMessage<LtValueIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, LtValueIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "lt_value";
	/**
	* The action reference.
	*/
	readonly reference: typeof ltValue;
	/**
	* The expected property.
	*/
	readonly expects: `<${string}`;
	/**
	* The less than value.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function ltValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): LtValueAction<TInput$1, TRequirement, undefined>;
declare function ltValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1, const TMessage extends ErrorMessage<LtValueIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): LtValueAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/mac/mac.d.ts
/**
* MAC issue interface.
*/
export interface MacIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "mac";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The MAC regex.
	*/
	readonly requirement: RegExp;
}
/**
* MAC action interface.
*/
export interface MacAction<TInput$1 extends string, TMessage extends ErrorMessage<MacIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, MacIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "mac";
	/**
	* The action reference.
	*/
	readonly reference: typeof mac;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The MAC regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function mac<TInput$1 extends string>(): MacAction<TInput$1, undefined>;
declare function mac<TInput$1 extends string, const TMessage extends ErrorMessage<MacIssue<TInput$1>> | undefined>(message: TMessage): MacAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/mac48/mac48.d.ts
/**
* 48-bit MAC issue interface.
*/
export interface Mac48Issue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "mac48";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The 48-bit MAC regex.
	*/
	readonly requirement: RegExp;
}
/**
* 48-bit MAC action interface.
*/
export interface Mac48Action<TInput$1 extends string, TMessage extends ErrorMessage<Mac48Issue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, Mac48Issue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "mac48";
	/**
	* The action reference.
	*/
	readonly reference: typeof mac48;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The 48-bit MAC regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function mac48<TInput$1 extends string>(): Mac48Action<TInput$1, undefined>;
declare function mac48<TInput$1 extends string, const TMessage extends ErrorMessage<Mac48Issue<TInput$1>> | undefined>(message: TMessage): Mac48Action<TInput$1, TMessage>;
//#endregion
//#region src/actions/mac64/mac64.d.ts
/**
* 64-bit MAC issue interface.
*/
export interface Mac64Issue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "mac64";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The 64-bit MAC regex.
	*/
	readonly requirement: RegExp;
}
/**
* 64-bit MAC action interface.
*/
export interface Mac64Action<TInput$1 extends string, TMessage extends ErrorMessage<Mac64Issue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, Mac64Issue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "mac64";
	/**
	* The action reference.
	*/
	readonly reference: typeof mac64;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The 64-bit MAC regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function mac64<TInput$1 extends string>(): Mac64Action<TInput$1, undefined>;
declare function mac64<TInput$1 extends string, const TMessage extends ErrorMessage<Mac64Issue<TInput$1>> | undefined>(message: TMessage): Mac64Action<TInput$1, TMessage>;
//#endregion
//#region src/actions/mapItems/mapItems.d.ts
/**
* Array action type.
*/
export type ArrayAction$2<TInput$1 extends ArrayInput, TOutput$1> = (item: TInput$1[number], index: number, array: TInput$1) => TOutput$1;
/**
* Map items action interface.
*/
export interface MapItemsAction<TInput$1 extends ArrayInput, TOutput$1> extends BaseTransformation<TInput$1, TOutput$1[], never> {
	/**
	* The action type.
	*/
	readonly type: "map_items";
	/**
	* The action reference.
	*/
	readonly reference: typeof mapItems;
	/**
	* The map items operation.
	*/
	readonly operation: ArrayAction$2<TInput$1, TOutput$1>;
}
declare function mapItems<TInput$1 extends ArrayInput, TOutput$1>(operation: ArrayAction$2<TInput$1, TOutput$1>): MapItemsAction<TInput$1, TOutput$1>;
//#endregion
//#region src/actions/maxBytes/maxBytes.d.ts
/**
* Max bytes issue interface.
*/
export interface MaxBytesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "max_bytes";
	/**
	* The expected property.
	*/
	readonly expected: `<=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The maximum bytes.
	*/
	readonly requirement: TRequirement;
}
/**
* Max bytes action interface.
*/
export interface MaxBytesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<MaxBytesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MaxBytesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "max_bytes";
	/**
	* The action reference.
	*/
	readonly reference: typeof maxBytes;
	/**
	* The expected property.
	*/
	readonly expects: `<=${TRequirement}`;
	/**
	* The maximum bytes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function maxBytes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): MaxBytesAction<TInput$1, TRequirement, undefined>;
declare function maxBytes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<MaxBytesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MaxBytesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/maxEntries/maxEntries.d.ts
/**
* Max entries issue interface.
*
* @beta
*/
export interface MaxEntriesIssue<TInput$1 extends EntriesInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "max_entries";
	/**
	* The expected property.
	*/
	readonly expected: `<=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The maximum entries.
	*/
	readonly requirement: TRequirement;
}
/**
* Max entries action interface.
*
* @beta
*/
export interface MaxEntriesAction<TInput$1 extends EntriesInput, TRequirement extends number, TMessage extends ErrorMessage<MaxEntriesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MaxEntriesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "max_entries";
	/**
	* The action reference.
	*/
	readonly reference: typeof maxEntries;
	/**
	* The expected property.
	*/
	readonly expects: `<=${TRequirement}`;
	/**
	* The maximum entries.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function maxEntries<TInput$1 extends EntriesInput, const TRequirement extends number>(requirement: TRequirement): MaxEntriesAction<TInput$1, TRequirement, undefined>;
declare function maxEntries<TInput$1 extends EntriesInput, const TRequirement extends number, const TMessage extends ErrorMessage<MaxEntriesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MaxEntriesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/maxGraphemes/maxGraphemes.d.ts
/**
* Max graphemes issue interface.
*/
export interface MaxGraphemesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "max_graphemes";
	/**
	* The expected property.
	*/
	readonly expected: `<=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The maximum graphemes.
	*/
	readonly requirement: TRequirement;
}
/**
* Max graphemes action interface.
*/
export interface MaxGraphemesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<MaxGraphemesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MaxGraphemesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "max_graphemes";
	/**
	* The action reference.
	*/
	readonly reference: typeof maxGraphemes;
	/**
	* The expected property.
	*/
	readonly expects: `<=${TRequirement}`;
	/**
	* The maximum graphemes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function maxGraphemes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): MaxGraphemesAction<TInput$1, TRequirement, undefined>;
declare function maxGraphemes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<MaxGraphemesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MaxGraphemesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/maxLength/maxLength.d.ts
/**
* Max length issue interface.
*/
export interface MaxLengthIssue<TInput$1 extends LengthInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "max_length";
	/**
	* The expected property.
	*/
	readonly expected: `<=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The maximum length.
	*/
	readonly requirement: TRequirement;
}
/**
* Max length action interface.
*/
export interface MaxLengthAction<TInput$1 extends LengthInput, TRequirement extends number, TMessage extends ErrorMessage<MaxLengthIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MaxLengthIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "max_length";
	/**
	* The action reference.
	*/
	readonly reference: typeof maxLength;
	/**
	* The expected property.
	*/
	readonly expects: `<=${TRequirement}`;
	/**
	* The maximum length.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function maxLength<TInput$1 extends LengthInput, const TRequirement extends number>(requirement: TRequirement): MaxLengthAction<TInput$1, TRequirement, undefined>;
declare function maxLength<TInput$1 extends LengthInput, const TRequirement extends number, const TMessage extends ErrorMessage<MaxLengthIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MaxLengthAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/maxSize/maxSize.d.ts
/**
* Max size issue interface.
*/
export interface MaxSizeIssue<TInput$1 extends SizeInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "max_size";
	/**
	* The expected property.
	*/
	readonly expected: `<=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The maximum size.
	*/
	readonly requirement: TRequirement;
}
/**
* Max size action interface.
*/
export interface MaxSizeAction<TInput$1 extends SizeInput, TRequirement extends number, TMessage extends ErrorMessage<MaxSizeIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MaxSizeIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "max_size";
	/**
	* The action reference.
	*/
	readonly reference: typeof maxSize;
	/**
	* The expected property.
	*/
	readonly expects: `<=${TRequirement}`;
	/**
	* The maximum size.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function maxSize<TInput$1 extends SizeInput, const TRequirement extends number>(requirement: TRequirement): MaxSizeAction<TInput$1, TRequirement, undefined>;
declare function maxSize<TInput$1 extends SizeInput, const TRequirement extends number, const TMessage extends ErrorMessage<MaxSizeIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MaxSizeAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/maxValue/maxValue.d.ts
/**
* Max value issue interface.
*/
export interface MaxValueIssue<TInput$1 extends ValueInput, TRequirement extends ValueInput> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "max_value";
	/**
	* The expected property.
	*/
	readonly expected: `<=${string}`;
	/**
	* The maximum value.
	*/
	readonly requirement: TRequirement;
}
/**
* Max value action interface.
*/
export interface MaxValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1, TMessage extends ErrorMessage<MaxValueIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MaxValueIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "max_value";
	/**
	* The action reference.
	*/
	readonly reference: typeof maxValue;
	/**
	* The expected property.
	*/
	readonly expects: `<=${string}`;
	/**
	* The maximum value.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function maxValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): MaxValueAction<TInput$1, TRequirement, undefined>;
declare function maxValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1, const TMessage extends ErrorMessage<MaxValueIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MaxValueAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/maxWords/maxWords.d.ts
/**
* Max words issue interface.
*/
export interface MaxWordsIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "max_words";
	/**
	* The expected property.
	*/
	readonly expected: `<=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The maximum words.
	*/
	readonly requirement: TRequirement;
}
/**
* Max words action interface.
*/
export interface MaxWordsAction<TInput$1 extends string, TLocales extends Intl.LocalesArgument, TRequirement extends number, TMessage extends ErrorMessage<MaxWordsIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MaxWordsIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "max_words";
	/**
	* The action reference.
	*/
	readonly reference: typeof maxWords;
	/**
	* The expected property.
	*/
	readonly expects: `<=${TRequirement}`;
	/**
	* The locales to be used.
	*/
	readonly locales: TLocales;
	/**
	* The maximum words.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function maxWords<TInput$1 extends string, TLocales extends Intl.LocalesArgument, const TRequirement extends number>(locales: TLocales, requirement: TRequirement): MaxWordsAction<TInput$1, TLocales, TRequirement, undefined>;
declare function maxWords<TInput$1 extends string, TLocales extends Intl.LocalesArgument, const TRequirement extends number, const TMessage extends ErrorMessage<MaxWordsIssue<TInput$1, TRequirement>> | undefined>(locales: TLocales, requirement: TRequirement, message: TMessage): MaxWordsAction<TInput$1, TLocales, TRequirement, TMessage>;
//#endregion
//#region src/actions/metadata/metadata.d.ts
/**
* Metadata action interface.
*/
export interface MetadataAction<TInput$1, TMetadata extends Record<string, unknown>> extends BaseMetadata<TInput$1> {
	/**
	* The action type.
	*/
	readonly type: "metadata";
	/**
	* The action reference.
	*/
	readonly reference: typeof metadata;
	/**
	* The metadata object.
	*/
	readonly metadata: TMetadata;
}
declare function metadata<TInput$1, const TMetadata extends Record<string, unknown>>(metadata_: TMetadata): MetadataAction<TInput$1, TMetadata>;
//#endregion
//#region src/actions/mimeType/mimeType.d.ts
/**
* Requirement type.
*/
export type Requirement = readonly `${string}/${string}`[];
/**
* MIME type issue interface.
*/
export interface MimeTypeIssue<TInput$1 extends Blob, TRequirement extends Requirement> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "mime_type";
	/**
	* The expected input.
	*/
	readonly expected: string;
	/**
	* The received input.
	*/
	readonly received: `"${string}"`;
	/**
	* The MIME types.
	*/
	readonly requirement: TRequirement;
}
/**
* MIME type action interface.
*/
export interface MimeTypeAction<TInput$1 extends Blob, TRequirement extends Requirement, TMessage extends ErrorMessage<MimeTypeIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MimeTypeIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "mime_type";
	/**
	* The action reference.
	*/
	readonly reference: typeof mimeType;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* The MIME types.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function mimeType<TInput$1 extends Blob, const TRequirement extends Requirement>(requirement: TRequirement): MimeTypeAction<TInput$1, TRequirement, undefined>;
declare function mimeType<TInput$1 extends Blob, const TRequirement extends Requirement, const TMessage extends ErrorMessage<MimeTypeIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MimeTypeAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/minBytes/minBytes.d.ts
/**
* Min bytes issue interface.
*/
export interface MinBytesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "min_bytes";
	/**
	* The expected property.
	*/
	readonly expected: `>=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The minimum bytes.
	*/
	readonly requirement: TRequirement;
}
/**
* Min bytes action interface.
*/
export interface MinBytesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<MinBytesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MinBytesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "min_bytes";
	/**
	* The action reference.
	*/
	readonly reference: typeof minBytes;
	/**
	* The expected property.
	*/
	readonly expects: `>=${TRequirement}`;
	/**
	* The minimum bytes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function minBytes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): MinBytesAction<TInput$1, TRequirement, undefined>;
declare function minBytes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<MinBytesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MinBytesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/minEntries/minEntries.d.ts
/**
* Min entries issue interface.
*
* @beta
*/
export interface MinEntriesIssue<TInput$1 extends EntriesInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "min_entries";
	/**
	* The expected property.
	*/
	readonly expected: `>=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The minimum entries.
	*/
	readonly requirement: TRequirement;
}
/**
* Min entries action interface.
*
* @beta
*/
export interface MinEntriesAction<TInput$1 extends EntriesInput, TRequirement extends number, TMessage extends ErrorMessage<MinEntriesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MinEntriesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "min_entries";
	/**
	* The action reference.
	*/
	readonly reference: typeof minEntries;
	/**
	* The expected property.
	*/
	readonly expects: `>=${TRequirement}`;
	/**
	* The minimum entries.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function minEntries<TInput$1 extends EntriesInput, const TRequirement extends number>(requirement: TRequirement): MinEntriesAction<TInput$1, TRequirement, undefined>;
declare function minEntries<TInput$1 extends EntriesInput, const TRequirement extends number, const TMessage extends ErrorMessage<MinEntriesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MinEntriesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/minGraphemes/minGraphemes.d.ts
/**
* Min graphemes issue interface.
*/
export interface MinGraphemesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "min_graphemes";
	/**
	* The expected property.
	*/
	readonly expected: `>=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The minimum graphemes.
	*/
	readonly requirement: TRequirement;
}
/**
* Min graphemes action interface.
*/
export interface MinGraphemesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<MinGraphemesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MinGraphemesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "min_graphemes";
	/**
	* The action reference.
	*/
	readonly reference: typeof minGraphemes;
	/**
	* The expected property.
	*/
	readonly expects: `>=${TRequirement}`;
	/**
	* The minimum graphemes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function minGraphemes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): MinGraphemesAction<TInput$1, TRequirement, undefined>;
declare function minGraphemes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<MinGraphemesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MinGraphemesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/minLength/minLength.d.ts
/**
* Min length issue interface.
*/
export interface MinLengthIssue<TInput$1 extends LengthInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "min_length";
	/**
	* The expected property.
	*/
	readonly expected: `>=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The minimum length.
	*/
	readonly requirement: TRequirement;
}
/**
* Min length action interface.
*/
export interface MinLengthAction<TInput$1 extends LengthInput, TRequirement extends number, TMessage extends ErrorMessage<MinLengthIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MinLengthIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "min_length";
	/**
	* The action reference.
	*/
	readonly reference: typeof minLength;
	/**
	* The expected property.
	*/
	readonly expects: `>=${TRequirement}`;
	/**
	* The minimum length.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function minLength<TInput$1 extends LengthInput, const TRequirement extends number>(requirement: TRequirement): MinLengthAction<TInput$1, TRequirement, undefined>;
declare function minLength<TInput$1 extends LengthInput, const TRequirement extends number, const TMessage extends ErrorMessage<MinLengthIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MinLengthAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/minSize/minSize.d.ts
/**
* Min size issue interface.
*/
export interface MinSizeIssue<TInput$1 extends SizeInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "min_size";
	/**
	* The expected property.
	*/
	readonly expected: `>=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The minimum size.
	*/
	readonly requirement: TRequirement;
}
/**
* Min size action interface.
*/
export interface MinSizeAction<TInput$1 extends SizeInput, TRequirement extends number, TMessage extends ErrorMessage<MinSizeIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MinSizeIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "min_size";
	/**
	* The action reference.
	*/
	readonly reference: typeof minSize;
	/**
	* The expected property.
	*/
	readonly expects: `>=${TRequirement}`;
	/**
	* The minimum size.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function minSize<TInput$1 extends SizeInput, const TRequirement extends number>(requirement: TRequirement): MinSizeAction<TInput$1, TRequirement, undefined>;
declare function minSize<TInput$1 extends SizeInput, const TRequirement extends number, const TMessage extends ErrorMessage<MinSizeIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MinSizeAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/minValue/minValue.d.ts
/**
* Min value issue interface.
*/
export interface MinValueIssue<TInput$1 extends ValueInput, TRequirement extends ValueInput> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "min_value";
	/**
	* The expected property.
	*/
	readonly expected: `>=${string}`;
	/**
	* The minimum value.
	*/
	readonly requirement: TRequirement;
}
/**
* Min value action interface.
*/
export interface MinValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1, TMessage extends ErrorMessage<MinValueIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MinValueIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "min_value";
	/**
	* The action reference.
	*/
	readonly reference: typeof minValue;
	/**
	* The expected property.
	*/
	readonly expects: `>=${string}`;
	/**
	* The minimum value.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function minValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): MinValueAction<TInput$1, TRequirement, undefined>;
declare function minValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1, const TMessage extends ErrorMessage<MinValueIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MinValueAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/minWords/minWords.d.ts
/**
* Min words issue interface.
*/
export interface MinWordsIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "min_words";
	/**
	* The expected property.
	*/
	readonly expected: `>=${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The minimum words.
	*/
	readonly requirement: TRequirement;
}
/**
* Min words action interface.
*/
export interface MinWordsAction<TInput$1 extends string, TLocales extends Intl.LocalesArgument, TRequirement extends number, TMessage extends ErrorMessage<MinWordsIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MinWordsIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "min_words";
	/**
	* The action reference.
	*/
	readonly reference: typeof minWords;
	/**
	* The expected property.
	*/
	readonly expects: `>=${TRequirement}`;
	/**
	* The locales to be used.
	*/
	readonly locales: TLocales;
	/**
	* The minimum words.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function minWords<TInput$1 extends string, TLocales extends Intl.LocalesArgument, const TRequirement extends number>(locales: TLocales, requirement: TRequirement): MinWordsAction<TInput$1, TLocales, TRequirement, undefined>;
declare function minWords<TInput$1 extends string, TLocales extends Intl.LocalesArgument, const TRequirement extends number, const TMessage extends ErrorMessage<MinWordsIssue<TInput$1, TRequirement>> | undefined>(locales: TLocales, requirement: TRequirement, message: TMessage): MinWordsAction<TInput$1, TLocales, TRequirement, TMessage>;
//#endregion
//#region src/actions/multipleOf/multipleOf.d.ts
/**
* Input type
*/
export type Input = number | bigint;
/**
* Multiple of issue interface.
*/
export interface MultipleOfIssue<TInput$1 extends Input, TRequirement extends Input> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "multiple_of";
	/**
	* The expected property.
	*/
	readonly expected: `%${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${TInput$1}`;
	/**
	* The divisor.
	*/
	readonly requirement: TRequirement;
}
/**
* Multiple of action interface.
*/
export interface MultipleOfAction<TInput$1 extends Input, TRequirement extends Input, TMessage extends ErrorMessage<MultipleOfIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, MultipleOfIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "multiple_of";
	/**
	* The action reference.
	*/
	readonly reference: typeof multipleOf;
	/**
	* The expected property.
	*/
	readonly expects: `%${TRequirement}`;
	/**
	* The divisor.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function multipleOf<TInput$1 extends number, const TRequirement extends number>(requirement: TRequirement): MultipleOfAction<TInput$1, TRequirement, undefined>;
declare function multipleOf<TInput$1 extends bigint, const TRequirement extends bigint>(requirement: TRequirement): MultipleOfAction<TInput$1, TRequirement, undefined>;
declare function multipleOf<TInput$1 extends number, const TRequirement extends number, const TMessage extends ErrorMessage<MultipleOfIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MultipleOfAction<TInput$1, TRequirement, TMessage>;
declare function multipleOf<TInput$1 extends bigint, const TRequirement extends bigint, const TMessage extends ErrorMessage<MultipleOfIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): MultipleOfAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/nanoid/nanoid.d.ts
/**
* Nano ID issue interface.
*/
export interface NanoIdIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "nanoid";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: string;
	/**
	* The Nano ID regex.
	*/
	readonly requirement: RegExp;
}
/**
* Nano ID issue type.
*
* @deprecated Use `NanoIdIssue` instead.
*/
export type NanoIDIssue<TInput$1 extends string> = NanoIdIssue<TInput$1>;
/**
* Nano ID action interface.
*/
export interface NanoIdAction<TInput$1 extends string, TMessage extends ErrorMessage<NanoIdIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, NanoIdIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "nanoid";
	/**
	* The action reference.
	*/
	readonly reference: typeof nanoid;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The Nano ID regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
/**
* Nano ID action type.
*
* @deprecated Use `NanoIdAction` instead.
*/
export type NanoIDAction<TInput$1 extends string, TMessage extends ErrorMessage<NanoIdIssue<TInput$1>> | undefined> = NanoIdAction<TInput$1, TMessage>;
declare function nanoid<TInput$1 extends string>(): NanoIdAction<TInput$1, undefined>;
declare function nanoid<TInput$1 extends string, const TMessage extends ErrorMessage<NanoIdIssue<TInput$1>> | undefined>(message: TMessage): NanoIdAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/nonEmpty/nonEmpty.d.ts
/**
* Non empty issue interface.
*/
export interface NonEmptyIssue<TInput$1 extends LengthInput> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "non_empty";
	/**
	* The expected input.
	*/
	readonly expected: "!0";
	/**
	* The received input.
	*/
	readonly received: "0";
}
/**
* Non empty action interface.
*/
export interface NonEmptyAction<TInput$1 extends LengthInput, TMessage extends ErrorMessage<NonEmptyIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, NonEmptyIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "non_empty";
	/**
	* The action reference.
	*/
	readonly reference: typeof nonEmpty;
	/**
	* The expected property.
	*/
	readonly expects: "!0";
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function nonEmpty<TInput$1 extends LengthInput>(): NonEmptyAction<TInput$1, undefined>;
declare function nonEmpty<TInput$1 extends LengthInput, const TMessage extends ErrorMessage<NonEmptyIssue<TInput$1>> | undefined>(message: TMessage): NonEmptyAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/normalize/normalize.d.ts
/**
* Normalize form type.
*/
export type NormalizeForm = "NFC" | "NFD" | "NFKC" | "NFKD";
/**
* Normalize action interface.
*/
export interface NormalizeAction<TForm extends NormalizeForm | undefined> extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "normalize";
	/**
	* The action reference.
	*/
	readonly reference: typeof normalize;
	/**
	* The normalization form.
	*/
	readonly form: TForm;
}
declare function normalize(): NormalizeAction<undefined>;
declare function normalize<TForm extends NormalizeForm | undefined>(form: TForm): NormalizeAction<TForm>;
//#endregion
//#region src/actions/notBytes/notBytes.d.ts
/**
* Not bytes issue interface.
*/
export interface NotBytesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_bytes";
	/**
	* The expected property.
	*/
	readonly expected: `!${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The not required bytes.
	*/
	readonly requirement: TRequirement;
}
/**
* Not bytes action interface.
*/
export interface NotBytesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<NotBytesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotBytesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_bytes";
	/**
	* The action reference.
	*/
	readonly reference: typeof notBytes;
	/**
	* The expected property.
	*/
	readonly expects: `!${TRequirement}`;
	/**
	* The not required bytes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notBytes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): NotBytesAction<TInput$1, TRequirement, undefined>;
declare function notBytes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<NotBytesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): NotBytesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/notEntries/notEntries.d.ts
/**
* Not entries issue interface.
*
* @beta
*/
export interface NotEntriesIssue<TInput$1 extends EntriesInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_entries";
	/**
	* The expected property.
	*/
	readonly expected: `!${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The not required entries.
	*/
	readonly requirement: TRequirement;
}
/**
* Not entries action interface.
*
* @beta
*/
export interface NotEntriesAction<TInput$1 extends EntriesInput, TRequirement extends number, TMessage extends ErrorMessage<NotEntriesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotEntriesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_entries";
	/**
	* The action reference.
	*/
	readonly reference: typeof notEntries;
	/**
	* The expected property.
	*/
	readonly expects: `!${TRequirement}`;
	/**
	* The not required entries.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notEntries<TInput$1 extends EntriesInput, const TRequirement extends number>(requirement: TRequirement): NotEntriesAction<TInput$1, TRequirement, undefined>;
declare function notEntries<TInput$1 extends EntriesInput, const TRequirement extends number, const TMessage extends ErrorMessage<NotEntriesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): NotEntriesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/notGraphemes/notGraphemes.d.ts
/**
* Not graphemes issue interface.
*/
export interface NotGraphemesIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_graphemes";
	/**
	* The expected property.
	*/
	readonly expected: `!${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The not required graphemes.
	*/
	readonly requirement: TRequirement;
}
/**
* Not graphemes action interface.
*/
export interface NotGraphemesAction<TInput$1 extends string, TRequirement extends number, TMessage extends ErrorMessage<NotGraphemesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotGraphemesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_graphemes";
	/**
	* The action reference.
	*/
	readonly reference: typeof notGraphemes;
	/**
	* The expected property.
	*/
	readonly expects: `!${TRequirement}`;
	/**
	* The not required graphemes.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notGraphemes<TInput$1 extends string, const TRequirement extends number>(requirement: TRequirement): NotGraphemesAction<TInput$1, TRequirement, undefined>;
declare function notGraphemes<TInput$1 extends string, const TRequirement extends number, const TMessage extends ErrorMessage<NotGraphemesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): NotGraphemesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/notLength/notLength.d.ts
/**
* Not length issue interface.
*/
export interface NotLengthIssue<TInput$1 extends LengthInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_length";
	/**
	* The expected property.
	*/
	readonly expected: `!${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${TRequirement}`;
	/**
	* The not required length.
	*/
	readonly requirement: TRequirement;
}
/**
* Not length action interface.
*/
export interface NotLengthAction<TInput$1 extends LengthInput, TRequirement extends number, TMessage extends ErrorMessage<NotLengthIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotLengthIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_length";
	/**
	* The action reference.
	*/
	readonly reference: typeof notLength;
	/**
	* The expected property.
	*/
	readonly expects: `!${TRequirement}`;
	/**
	* The not required length.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notLength<TInput$1 extends LengthInput, const TRequirement extends number>(requirement: TRequirement): NotLengthAction<TInput$1, TRequirement, undefined>;
declare function notLength<TInput$1 extends LengthInput, const TRequirement extends number, const TMessage extends ErrorMessage<NotLengthIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): NotLengthAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/notSize/notSize.d.ts
/**
* Not size issue interface.
*/
export interface NotSizeIssue<TInput$1 extends SizeInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_size";
	/**
	* The expected property.
	*/
	readonly expected: `!${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${TRequirement}`;
	/**
	* The not required size.
	*/
	readonly requirement: TRequirement;
}
/**
* Not size action interface.
*/
export interface NotSizeAction<TInput$1 extends SizeInput, TRequirement extends number, TMessage extends ErrorMessage<NotSizeIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotSizeIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_size";
	/**
	* The action reference.
	*/
	readonly reference: typeof notSize;
	/**
	* The expected property.
	*/
	readonly expects: `!${TRequirement}`;
	/**
	* The not required size.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notSize<TInput$1 extends SizeInput, const TRequirement extends number>(requirement: TRequirement): NotSizeAction<TInput$1, TRequirement, undefined>;
declare function notSize<TInput$1 extends SizeInput, const TRequirement extends number, const TMessage extends ErrorMessage<NotSizeIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): NotSizeAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/notValue/notValue.d.ts
/**
* Not value issue interface.
*/
export interface NotValueIssue<TInput$1 extends ValueInput, TRequirement extends TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_value";
	/**
	* The expected property.
	*/
	readonly expected: `!${string}`;
	/**
	* The not required value.
	*/
	readonly requirement: TRequirement;
}
/**
* Not value action interface.
*/
export interface NotValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1, TMessage extends ErrorMessage<NotValueIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotValueIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_value";
	/**
	* The action reference.
	*/
	readonly reference: typeof notValue;
	/**
	* The expected property.
	*/
	readonly expects: `!${string}`;
	/**
	* The not required value.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): NotValueAction<TInput$1, TRequirement, undefined>;
declare function notValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1, const TMessage extends ErrorMessage<NotValueIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): NotValueAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/notValues/notValues.d.ts
/**
* Not values issue type.
*/
export interface NotValuesIssue<TInput$1 extends ValueInput, TRequirement extends readonly TInput$1[]> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_values";
	/**
	* The expected property.
	*/
	readonly expected: `!${string}`;
	/**
	* The not required values.
	*/
	readonly requirement: TRequirement;
}
/**
* Not values action type.
*/
export interface NotValuesAction<TInput$1 extends ValueInput, TRequirement extends readonly TInput$1[], TMessage extends ErrorMessage<NotValuesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotValuesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_values";
	/**
	* The action reference.
	*/
	readonly reference: typeof notValues;
	/**
	* The expected property.
	*/
	readonly expects: `!${string}`;
	/**
	* The not required values.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notValues<TInput$1 extends ValueInput, const TRequirement extends readonly TInput$1[]>(requirement: TRequirement): NotValuesAction<TInput$1, TRequirement, undefined>;
declare function notValues<TInput$1 extends ValueInput, const TRequirement extends readonly TInput$1[], const TMessage extends ErrorMessage<NotValuesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): NotValuesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/notWords/notWords.d.ts
/**
* Not words issue interface.
*/
export interface NotWordsIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "not_words";
	/**
	* The expected property.
	*/
	readonly expected: `!${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The not required words.
	*/
	readonly requirement: TRequirement;
}
/**
* Not words action interface.
*/
export interface NotWordsAction<TInput$1 extends string, TLocales extends Intl.LocalesArgument, TRequirement extends number, TMessage extends ErrorMessage<NotWordsIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, NotWordsIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "not_words";
	/**
	* The action reference.
	*/
	readonly reference: typeof notWords;
	/**
	* The expected property.
	*/
	readonly expects: `!${TRequirement}`;
	/**
	* The locales to be used.
	*/
	readonly locales: TLocales;
	/**
	* The not required words.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function notWords<TInput$1 extends string, TLocales extends Intl.LocalesArgument, const TRequirement extends number>(locales: TLocales, requirement: TRequirement): NotWordsAction<TInput$1, TLocales, TRequirement, undefined>;
declare function notWords<TInput$1 extends string, TLocales extends Intl.LocalesArgument, const TRequirement extends number, const TMessage extends ErrorMessage<NotWordsIssue<TInput$1, TRequirement>> | undefined>(locales: TLocales, requirement: TRequirement, message: TMessage): NotWordsAction<TInput$1, TLocales, TRequirement, TMessage>;
//#endregion
//#region src/actions/octal/octal.d.ts
/**
* Octal issue interface.
*/
export interface OctalIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "octal";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The octal regex.
	*/
	readonly requirement: RegExp;
}
/**
* Octal action interface.
*/
export interface OctalAction<TInput$1 extends string, TMessage extends ErrorMessage<OctalIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, OctalIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "octal";
	/**
	* The action reference.
	*/
	readonly reference: typeof octal;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The octal regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function octal<TInput$1 extends string>(): OctalAction<TInput$1, undefined>;
declare function octal<TInput$1 extends string, const TMessage extends ErrorMessage<OctalIssue<TInput$1>> | undefined>(message: TMessage): OctalAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/parseBoolean/parseBoolean.d.ts
/**
* Parse boolean config interface.
*
* @beta
*/
export interface ParseBooleanConfig {
	/**
	* The truthy values.
	*/
	truthy?: MaybeReadonly<unknown[]> | undefined;
	/**
	* The falsy values.
	*/
	falsy?: MaybeReadonly<unknown[]> | undefined;
}
/**
* Parse boolean issue interface.
*
* @beta
*/
export interface ParseBooleanIssue<TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "parse_boolean";
	/**
	* The expected property.
	*/
	readonly expected: string;
}
/**
* Parse boolean action interface.
*
* @beta
*/
export interface ParseBooleanAction<TInput$1, TConfig extends ParseBooleanConfig | undefined, TMessage extends ErrorMessage<ParseBooleanIssue<TInput$1>> | undefined = undefined> extends BaseTransformation<TInput$1, boolean, ParseBooleanIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "parse_boolean";
	/**
	* The action reference.
	*/
	readonly reference: typeof parseBoolean;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* The parse boolean config.
	*/
	readonly config: TConfig;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function parseBoolean<TInput$1>(): ParseBooleanAction<TInput$1, undefined, undefined>;
declare function parseBoolean<TInput$1, const TConfig extends ParseBooleanConfig | undefined>(config: TConfig): ParseBooleanAction<TInput$1, TConfig, undefined>;
declare function parseBoolean<TInput$1, const TConfig extends ParseBooleanConfig | undefined, const TMessage extends ErrorMessage<ParseBooleanIssue<TInput$1>> | undefined>(config: TConfig, message: TMessage): ParseBooleanAction<TInput$1, TConfig, TMessage>;
//#endregion
//#region src/actions/parseJson/parseJson.d.ts
/**
* Parse JSON config interface.
*
* @beta
*/
export interface ParseJsonConfig {
	/**
	* The JSON reviver function.
	*/
	reviver?: (this: any, key: string, value: any) => any;
}
/**
* Parse JSON issue interface.
*
* @beta
*/
export interface ParseJsonIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "parse_json";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
}
/**
* Parse JSON action interface.
*
* @beta
*/
export interface ParseJsonAction<TInput$1 extends string, TConfig extends ParseJsonConfig | undefined, TMessage extends ErrorMessage<ParseJsonIssue<TInput$1>> | undefined> extends BaseTransformation<TInput$1, unknown, ParseJsonIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "parse_json";
	/**
	* The action reference.
	*/
	readonly reference: typeof parseJson;
	/**
	* The action config.
	*/
	readonly config: TConfig;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function parseJson<TInput$1 extends string>(): ParseJsonAction<TInput$1, undefined, undefined>;
declare function parseJson<TInput$1 extends string, const TConfig extends ParseJsonConfig | undefined>(config: TConfig): ParseJsonAction<TInput$1, TConfig, undefined>;
declare function parseJson<TInput$1 extends string, const TConfig extends ParseJsonConfig | undefined, const TMessage extends ErrorMessage<ParseJsonIssue<TInput$1>> | undefined>(config: TConfig, message: TMessage): ParseJsonAction<TInput$1, TConfig, TMessage>;
//#endregion
//#region src/actions/partialCheck/types.d.ts
/**
* Partial input type.
*/
export type PartialInput = Record<string, unknown> | ArrayLike<unknown>;
/**
* Partial check issue interface.
*/
export interface PartialCheckIssue<TInput$1 extends PartialInput> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "partial_check";
	/**
	* The expected input.
	*/
	readonly expected: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: TInput$1) => MaybePromise<boolean>;
}
/**
* Extracts the exact keys of a tuple, array or object.
*/
export type KeyOf<TValue$1> = IsAny<TValue$1> extends true ? never : TValue$1 extends readonly unknown[] ? number extends TValue$1["length"] ? "$" : {
	[TKey in keyof TValue$1]: TKey extends `${infer TIndex extends number}` ? TIndex : never;
}[number] : TValue$1 extends Record<string, unknown> ? keyof TValue$1 & (string | number) : never;
/**
* Path type.
*/
export type Path = readonly (string | number)[];
/**
* Required path type.
*/
export type RequiredPath = readonly [
	string | number,
	...Path
];
/**
* Paths type.
*/
export type Paths = readonly RequiredPath[];
/**
* Required paths type.
*/
export type RequiredPaths = readonly [
	RequiredPath,
	...RequiredPath[]
];
/**
* Lazily evaluate only the first valid path segment based on the given value.
*/
export type LazyPath<TValue$1, TPathToCheck extends Path, TValidPath extends Path = readonly [
]> = TPathToCheck extends readonly [
] ? TValidPath : TPathToCheck extends readonly [
	infer TFirstKey extends KeyOf<TValue$1>,
	...infer TPathRest extends Path
] ? LazyPath<TFirstKey extends keyof TValue$1 ? TValue$1[TFirstKey] : TFirstKey extends "$" ? TValue$1 extends readonly unknown[] ? TValue$1[number] : never : never, TPathRest, readonly [
	...TValidPath,
	TFirstKey
]> : IsNever<KeyOf<TValue$1>> extends false ? readonly [
	...TValidPath,
	KeyOf<TValue$1>
] : TValidPath;
/**
* Returns the path if valid, otherwise the first possible valid path based on
* the given value.
*/
export type ValidPath<TValue$1, TPath extends RequiredPath> = TPath extends LazyPath<TValue$1, TPath> ? TPath : LazyPath<TValue$1, TPath>;
/**
* Returns a valid path for any given path based on the given value.
*/
export type ValidPaths<TValue$1, TPaths extends RequiredPaths> = {
	[TKey in keyof TPaths]: ValidPath<TValue$1, TPaths[TKey]>;
};
/**
* Deeply picks specific keys.
*
* Hint: If this type is ever exported and accessible from the outside, it must
* be wrapped in `UnionToIntersect` to avoid invalid results.
*/
export type DeepPick<TValue$1, TPath extends Path> = TPath extends readonly [
	infer TFirstKey extends string | number,
	...infer TPathRest extends Path
] ? TValue$1 extends readonly unknown[] ? number extends TValue$1["length"] ? TPathRest extends readonly [
] ? TValue$1 : DeepPick<TValue$1[number], TPathRest>[] : {
	[TKey in keyof TValue$1]: TKey extends `${TFirstKey}` ? TPathRest extends readonly [
	] ? TValue$1[TKey] : DeepPick<TValue$1[TKey], TPathRest> : unknown;
} : {
	[TKey in keyof TValue$1 as TKey extends TFirstKey ? TKey : never]: TPathRest extends readonly [
	] ? TValue$1[TKey] : DeepPick<TValue$1[TKey], TPathRest>;
} : never;
/**
* Deeply merges two types.
*/
export type DeepMerge<TValue1, TValue2> = TValue1 extends readonly unknown[] ? TValue2 extends readonly unknown[] ? number extends TValue1["length"] | TValue2["length"] ? DeepMerge<TValue1[number], TValue2[number]>[] : {
	[TKey in keyof TValue1]: TKey extends keyof TValue2 ? unknown extends TValue1[TKey] ? TValue2[TKey] : TValue1[TKey] : never;
} : never : TValue1 extends Record<string, unknown> ? TValue2 extends Record<string, unknown> ? {
	[TKey in keyof (TValue1 & TValue2)]: TKey extends keyof TValue1 ? TKey extends keyof TValue2 ? DeepMerge<TValue1[TKey], TValue2[TKey]> : TValue1[TKey] : TKey extends keyof TValue2 ? TValue2[TKey] : never;
} : never : TValue1 & TValue2;
/**
* Deeply picks N specific keys.
*/
export type DeepPickN<TInput$1, TPaths extends Paths> = TPaths extends readonly [
	infer TFirstPath extends Path,
	...infer TRestPaths extends Paths
] ? TRestPaths extends readonly [
] ? DeepPick<TInput$1, TFirstPath> : DeepMerge<DeepPick<TInput$1, TFirstPath>, DeepPickN<TInput$1, TRestPaths>> : TInput$1;
//#endregion
//#region src/actions/partialCheck/partialCheck.d.ts
/**
* Partial check action interface.
*/
export interface PartialCheckAction<TInput$1 extends PartialInput, TPaths extends Paths, TSelection extends DeepPickN<TInput$1, TPaths>, TMessage extends ErrorMessage<PartialCheckIssue<TSelection>> | undefined> extends BaseValidation<TInput$1, TInput$1, PartialCheckIssue<TSelection>> {
	/**
	* The action type.
	*/
	readonly type: "partial_check";
	/**
	* The action reference.
	*/
	readonly reference: typeof partialCheck;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The selected paths.
	*/
	readonly paths: TPaths;
	/**
	* The validation function.
	*/
	readonly requirement: (input: TSelection) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function partialCheck<TInput$1 extends PartialInput, const TPaths extends RequiredPaths, const TSelection extends DeepPickN<TInput$1, TPaths>>(paths: ValidPaths<TInput$1, TPaths>, requirement: (input: TSelection) => boolean): PartialCheckAction<TInput$1, TPaths, TSelection, undefined>;
declare function partialCheck<TInput$1 extends PartialInput, const TPaths extends RequiredPaths, const TSelection extends DeepPickN<TInput$1, TPaths>, const TMessage extends ErrorMessage<PartialCheckIssue<TSelection>> | undefined>(paths: ValidPaths<TInput$1, TPaths>, requirement: (input: TSelection) => boolean, message: TMessage): PartialCheckAction<TInput$1, TPaths, TSelection, TMessage>;
//#endregion
//#region src/actions/partialCheck/partialCheckAsync.d.ts
/**
* Partial check action async interface.
*/
export interface PartialCheckActionAsync<TInput$1 extends PartialInput, TPaths extends Paths, TSelection extends DeepPickN<TInput$1, TPaths>, TMessage extends ErrorMessage<PartialCheckIssue<TSelection>> | undefined> extends BaseValidationAsync<TInput$1, TInput$1, PartialCheckIssue<TSelection>> {
	/**
	* The action type.
	*/
	readonly type: "partial_check";
	/**
	* The action reference.
	*/
	readonly reference: typeof partialCheckAsync;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The selected paths.
	*/
	readonly paths: TPaths;
	/**
	* The validation function.
	*/
	readonly requirement: (input: TSelection) => MaybePromise<boolean>;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function partialCheckAsync<TInput$1 extends PartialInput, const TPaths extends RequiredPaths, const TSelection extends DeepPickN<TInput$1, TPaths>>(paths: ValidPaths<TInput$1, TPaths>, requirement: (input: TSelection) => MaybePromise<boolean>): PartialCheckActionAsync<TInput$1, TPaths, TSelection, undefined>;
declare function partialCheckAsync<TInput$1 extends PartialInput, const TPaths extends RequiredPaths, const TSelection extends DeepPickN<TInput$1, TPaths>, const TMessage extends ErrorMessage<PartialCheckIssue<TSelection>> | undefined>(paths: ValidPaths<TInput$1, TPaths>, requirement: (input: TSelection) => MaybePromise<boolean>, message: TMessage): PartialCheckActionAsync<TInput$1, TPaths, TSelection, TMessage>;
//#endregion
//#region src/actions/rawCheck/types.d.ts
/**
* Raw check issue interface.
*/
export interface RawCheckIssue<TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "raw_check";
}
/**
* Raw check issue info interface.
*/
export interface RawCheckIssueInfo<TInput$1> {
	label?: string | undefined;
	input?: unknown | undefined;
	expected?: string | undefined;
	received?: string | undefined;
	message?: ErrorMessage<RawCheckIssue<TInput$1>> | undefined;
	path?: [
		IssuePathItem,
		...IssuePathItem[]
	] | undefined;
}
/**
* Raw check add issue type.
*/
export type RawCheckAddIssue<TInput$1> = (info?: RawCheckIssueInfo<TInput$1>) => void;
/**
* Raw check context interface.
*/
export interface RawCheckContext<TInput$1> {
	readonly dataset: OutputDataset<TInput$1, BaseIssue<unknown>>;
	readonly config: Config<RawCheckIssue<TInput$1>>;
	readonly addIssue: RawCheckAddIssue<TInput$1>;
}
//#endregion
//#region src/actions/rawCheck/rawCheck.d.ts
/**
* Raw check action interface.
*/
export interface RawCheckAction<TInput$1> extends BaseValidation<TInput$1, TInput$1, RawCheckIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "raw_check";
	/**
	* The action reference.
	*/
	readonly reference: typeof rawCheck;
	/**
	* The expected property.
	*/
	readonly expects: null;
}
declare function rawCheck<TInput$1>(action: (context: RawCheckContext<TInput$1>) => void): RawCheckAction<TInput$1>;
//#endregion
//#region src/actions/rawCheck/rawCheckAsync.d.ts
/**
* Raw check action async interface.
*/
export interface RawCheckActionAsync<TInput$1> extends BaseValidationAsync<TInput$1, TInput$1, RawCheckIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "raw_check";
	/**
	* The action reference.
	*/
	readonly reference: typeof rawCheckAsync;
	/**
	* The expected property.
	*/
	readonly expects: null;
}
declare function rawCheckAsync<TInput$1>(action: (context: RawCheckContext<TInput$1>) => MaybePromise<void>): RawCheckActionAsync<TInput$1>;
//#endregion
//#region src/actions/rawTransform/types.d.ts
/**
* Raw transform issue interface.
*/
export interface RawTransformIssue<TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "raw_transform";
}
/**
* Raw transform issue info interface.
*/
export interface RawTransformIssueInfo<TInput$1> {
	label?: string | undefined;
	input?: unknown | undefined;
	expected?: string | undefined;
	received?: string | undefined;
	message?: ErrorMessage<RawTransformIssue<TInput$1>> | undefined;
	path?: [
		IssuePathItem,
		...IssuePathItem[]
	] | undefined;
}
/**
* Raw transform add issue type.
*/
export type RawTransformAddIssue<TInput$1> = (info?: RawTransformIssueInfo<TInput$1>) => void;
/**
* Raw transform context interface.
*/
export interface RawTransformContext<TInput$1> {
	readonly dataset: SuccessDataset<TInput$1>;
	readonly config: Config<RawTransformIssue<TInput$1>>;
	readonly addIssue: RawTransformAddIssue<TInput$1>;
	readonly NEVER: never;
}
//#endregion
//#region src/actions/rawTransform/rawTransform.d.ts
/**
* Raw transform action interface.
*/
export interface RawTransformAction<TInput$1, TOutput$1> extends BaseTransformation<TInput$1, TOutput$1, RawTransformIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "raw_transform";
	/**
	* The action reference.
	*/
	readonly reference: typeof rawTransform;
}
declare function rawTransform<TInput$1, TOutput$1>(action: (context: RawTransformContext<TInput$1>) => TOutput$1): RawTransformAction<TInput$1, TOutput$1>;
//#endregion
//#region src/actions/rawTransform/rawTransformAsync.d.ts
/**
* Raw transform action async interface.
*/
export interface RawTransformActionAsync<TInput$1, TOutput$1> extends BaseTransformationAsync<TInput$1, TOutput$1, RawTransformIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "raw_transform";
	/**
	* The action reference.
	*/
	readonly reference: typeof rawTransformAsync;
}
declare function rawTransformAsync<TInput$1, TOutput$1>(action: (context: RawTransformContext<TInput$1>) => MaybePromise<TOutput$1>): RawTransformActionAsync<TInput$1, TOutput$1>;
//#endregion
//#region src/actions/readonly/readonly.d.ts
/**
* Readonly output type.
*/
export type ReadonlyOutput<TInput$1> = TInput$1 extends Map<infer TKey, infer TValue> ? ReadonlyMap<TKey, TValue> : TInput$1 extends Set<infer TValue> ? ReadonlySet<TValue> : Readonly<TInput$1>;
/**
* Readonly action interface.
*/
export interface ReadonlyAction<TInput$1> extends BaseTransformation<TInput$1, ReadonlyOutput<TInput$1>, never> {
	/**
	* The action type.
	*/
	readonly type: "readonly";
	/**
	* The action reference.
	*/
	readonly reference: typeof readonly;
}
declare function readonly<TInput$1>(): ReadonlyAction<TInput$1>;
//#endregion
//#region src/actions/reduceItems/reduceItems.d.ts
/**
* Array action type.
*/
export type ArrayAction$1<TInput$1 extends ArrayInput, TOutput$1> = (output: TOutput$1, item: TInput$1[number], index: number, array: TInput$1) => TOutput$1;
/**
* Reduce items action interface.
*/
export interface ReduceItemsAction<TInput$1 extends ArrayInput, TOutput$1> extends BaseTransformation<TInput$1, TOutput$1, never> {
	/**
	* The action type.
	*/
	readonly type: "reduce_items";
	/**
	* The action reference.
	*/
	readonly reference: typeof reduceItems;
	/**
	* The reduce items operation.
	*/
	readonly operation: ArrayAction$1<TInput$1, TOutput$1>;
	/**
	* The initial value.
	*/
	readonly initial: TOutput$1;
}
declare function reduceItems<TInput$1 extends ArrayInput, TOutput$1>(operation: ArrayAction$1<TInput$1, TOutput$1>, initial: TOutput$1): ReduceItemsAction<TInput$1, TOutput$1>;
//#endregion
//#region src/actions/regex/regex.d.ts
/**
* Regex issue interface.
*/
export interface RegexIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "regex";
	/**
	* The expected input.
	*/
	readonly expected: string;
	/**
	* The received input.
	*/
	readonly received: `"${string}"`;
	/**
	* The regex pattern.
	*/
	readonly requirement: RegExp;
}
/**
* Regex action interface.
*/
export interface RegexAction<TInput$1 extends string, TMessage extends ErrorMessage<RegexIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, RegexIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "regex";
	/**
	* The action reference.
	*/
	readonly reference: typeof regex;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* The regex pattern.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function regex<TInput$1 extends string>(requirement: RegExp): RegexAction<TInput$1, undefined>;
declare function regex<TInput$1 extends string, const TMessage extends ErrorMessage<RegexIssue<TInput$1>> | undefined>(requirement: RegExp, message: TMessage): RegexAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/returns/returns.d.ts
/**
* Returns action type.
*/
export interface ReturnsAction<TInput$1 extends (...args: any[]) => unknown, TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>> extends BaseTransformation<TInput$1, (...args: Parameters<TInput$1>) => InferOutput<TSchema>, never> {
	/**
	* The action type.
	*/
	readonly type: "returns";
	/**
	* The action reference.
	*/
	readonly reference: typeof returns;
	/**
	* The arguments schema.
	*/
	readonly schema: TSchema;
}
declare function returns<TInput$1 extends (...args: any[]) => unknown, TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): ReturnsAction<TInput$1, TSchema>;
//#endregion
//#region src/actions/returns/returnsAsync.d.ts
/**
* Returns action async type.
*/
export interface ReturnsActionAsync<TInput$1 extends (...args: any[]) => unknown, TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> extends BaseTransformation<TInput$1, (...args: Parameters<TInput$1>) => Promise<Awaited<InferOutput<TSchema>>>, never> {
	/**
	* The action type.
	*/
	readonly type: "returns";
	/**
	* The action reference.
	*/
	readonly reference: typeof returnsAsync;
	/**
	* The arguments schema.
	*/
	readonly schema: TSchema;
}
declare function returnsAsync<TInput$1 extends (...args: any[]) => unknown, TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(schema: TSchema): ReturnsActionAsync<TInput$1, TSchema>;
//#endregion
//#region src/actions/rfcEmail/rfcEmail.d.ts
/**
* RFC email issue interface.
*/
export interface RfcEmailIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "rfc_email";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The RFC email regex.
	*/
	readonly requirement: RegExp;
}
/**
* RFC email action interface.
*/
export interface RfcEmailAction<TInput$1 extends string, TMessage extends ErrorMessage<RfcEmailIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, RfcEmailIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "rfc_email";
	/**
	* The action reference.
	*/
	readonly reference: typeof rfcEmail;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The RFC email regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function rfcEmail<TInput$1 extends string>(): RfcEmailAction<TInput$1, undefined>;
declare function rfcEmail<TInput$1 extends string, const TMessage extends ErrorMessage<RfcEmailIssue<TInput$1>> | undefined>(message: TMessage): RfcEmailAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/safeInteger/safeInteger.d.ts
/**
* Safe integer issue interface.
*/
export interface SafeIntegerIssue<TInput$1 extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "safe_integer";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The validation function.
	*/
	readonly requirement: (input: number) => boolean;
}
/**
* Safe integer action interface.
*/
export interface SafeIntegerAction<TInput$1 extends number, TMessage extends ErrorMessage<SafeIntegerIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, SafeIntegerIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "safe_integer";
	/**
	* The action reference.
	*/
	readonly reference: typeof safeInteger;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: number) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function safeInteger<TInput$1 extends number>(): SafeIntegerAction<TInput$1, undefined>;
declare function safeInteger<TInput$1 extends number, const TMessage extends ErrorMessage<SafeIntegerIssue<TInput$1>> | undefined>(message: TMessage): SafeIntegerAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/size/size.d.ts
/**
* Size issue interface.
*/
export interface SizeIssue<TInput$1 extends SizeInput, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "size";
	/**
	* The expected property.
	*/
	readonly expected: `${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The required size.
	*/
	readonly requirement: TRequirement;
}
/**
* Size action interface.
*/
export interface SizeAction<TInput$1 extends SizeInput, TRequirement extends number, TMessage extends ErrorMessage<SizeIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, SizeIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "size";
	/**
	* The action reference.
	*/
	readonly reference: typeof size;
	/**
	* The expected property.
	*/
	readonly expects: `${TRequirement}`;
	/**
	* The required size.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function size<TInput$1 extends SizeInput, const TRequirement extends number>(requirement: TRequirement): SizeAction<TInput$1, TRequirement, undefined>;
declare function size<TInput$1 extends SizeInput, const TRequirement extends number, const TMessage extends ErrorMessage<SizeIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): SizeAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/slug/slug.d.ts
/**
* Slug issue type.
*/
export interface SlugIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "slug";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The slug regex.
	*/
	readonly requirement: RegExp;
}
/**
* Slug action type.
*/
export interface SlugAction<TInput$1 extends string, TMessage extends ErrorMessage<SlugIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, SlugIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "slug";
	/**
	* The action reference.
	*/
	readonly reference: typeof slug;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The slug regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function slug<TInput$1 extends string>(): SlugAction<TInput$1, undefined>;
declare function slug<TInput$1 extends string, const TMessage extends ErrorMessage<SlugIssue<TInput$1>> | undefined>(message: TMessage): SlugAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/someItem/someItem.d.ts
/**
* Some item issue interface.
*/
export interface SomeItemIssue<TInput$1 extends ArrayInput> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "some_item";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The validation function.
	*/
	readonly requirement: ArrayRequirement<TInput$1>;
}
/**
* Some item action interface.
*/
export interface SomeItemAction<TInput$1 extends ArrayInput, TMessage extends ErrorMessage<SomeItemIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, SomeItemIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "some_item";
	/**
	* The action reference.
	*/
	readonly reference: typeof someItem;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: ArrayRequirement<TInput$1>;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function someItem<TInput$1 extends ArrayInput>(requirement: ArrayRequirement<TInput$1>): SomeItemAction<TInput$1, undefined>;
declare function someItem<TInput$1 extends ArrayInput, const TMessage extends ErrorMessage<SomeItemIssue<TInput$1>> | undefined>(requirement: ArrayRequirement<TInput$1>, message: TMessage): SomeItemAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/sortItems/sortItems.d.ts
/**
* Array action type.
*/
export type ArrayAction<TInput$1 extends ArrayInput> = (itemA: TInput$1[number], itemB: TInput$1[number]) => number;
/**
* Sort items action interface.
*/
export interface SortItemsAction<TInput$1 extends ArrayInput> extends BaseTransformation<TInput$1, TInput$1, never> {
	/**
	* The action type.
	*/
	readonly type: "sort_items";
	/**
	* The action reference.
	*/
	readonly reference: typeof sortItems;
	/**
	* The sort items operation.
	*/
	readonly operation: ArrayAction<TInput$1> | undefined;
}
declare function sortItems<TInput$1 extends ArrayInput>(operation?: ArrayAction<TInput$1>): SortItemsAction<TInput$1>;
//#endregion
//#region src/actions/startsWith/startsWith.d.ts
/**
* Starts with issue interface.
*/
export interface StartsWithIssue<TInput$1 extends string, TRequirement extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "starts_with";
	/**
	* The expected property.
	*/
	readonly expected: `"${TRequirement}"`;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The start string.
	*/
	readonly requirement: TRequirement;
}
/**
* Starts with action interface.
*/
export interface StartsWithAction<TInput$1 extends string, TRequirement extends string, TMessage extends ErrorMessage<StartsWithIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, StartsWithIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "starts_with";
	/**
	* The action reference.
	*/
	readonly reference: typeof startsWith;
	/**
	* The expected property.
	*/
	readonly expects: `"${TRequirement}"`;
	/**
	* The start string.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function startsWith<TInput$1 extends string, const TRequirement extends string>(requirement: TRequirement): StartsWithAction<TInput$1, TRequirement, undefined>;
declare function startsWith<TInput$1 extends string, const TRequirement extends string, const TMessage extends ErrorMessage<StartsWithIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): StartsWithAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/stringifyJson/stringifyJson.d.ts
/**
* Stringify JSON config interface.
*
* @beta
*/
export interface StringifyJsonConfig {
	/**
	* The JSON replacer function or array.
	*/
	replacer?: ((this: any, key: string, value: any) => any) | (number | string)[];
	/**
	* The JSON space option.
	*/
	space?: string | number;
}
/**
* Stringify JSON issue interface.
*
* @beta
*/
export interface StringifyJsonIssue<TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "stringify_json";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
}
/**
* Stringify JSON action interface.
*
* @beta
*/
export interface StringifyJsonAction<TInput$1, TConfig extends StringifyJsonConfig | undefined, TMessage extends ErrorMessage<StringifyJsonIssue<TInput$1>> | undefined> extends BaseTransformation<TInput$1, string, StringifyJsonIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "stringify_json";
	/**
	* The action reference.
	*/
	readonly reference: typeof stringifyJson;
	/**
	* The action config.
	*/
	readonly config: TConfig;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function stringifyJson<TInput$1>(): StringifyJsonAction<TInput$1, undefined, undefined>;
declare function stringifyJson<TInput$1, const TConfig extends StringifyJsonConfig | undefined>(config: TConfig): StringifyJsonAction<TInput$1, TConfig, undefined>;
declare function stringifyJson<TInput$1, const TConfig extends StringifyJsonConfig | undefined, const TMessage extends ErrorMessage<StringifyJsonIssue<TInput$1>> | undefined>(config: TConfig, message: TMessage): StringifyJsonAction<TInput$1, TConfig, TMessage>;
//#endregion
//#region src/actions/toBigint/toBigint.d.ts
/**
* To bigint issue interface.
*/
export interface ToBigintIssue<TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "to_bigint";
	/**
	* The expected property.
	*/
	readonly expected: null;
}
/**
* To bigint action interface.
*/
export interface ToBigintAction<TInput$1, TMessage extends ErrorMessage<ToBigintIssue<TInput$1>> | undefined> extends BaseTransformation<TInput$1, bigint, ToBigintIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "to_bigint";
	/**
	* The action reference.
	*/
	readonly reference: typeof toBigint;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function toBigint<TInput$1>(): ToBigintAction<TInput$1, undefined>;
declare function toBigint<TInput$1, const TMessage extends ErrorMessage<ToBigintIssue<TInput$1>> | undefined>(message: TMessage): ToBigintAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/toBoolean/toBoolean.d.ts
/**
* To boolean action interface.
*/
export interface ToBooleanAction<TInput$1> extends BaseTransformation<TInput$1, boolean, never> {
	/**
	* The action type.
	*/
	readonly type: "to_boolean";
	/**
	* The action reference.
	*/
	readonly reference: typeof toBoolean;
}
declare function toBoolean<TInput$1>(): ToBooleanAction<TInput$1>;
//#endregion
//#region src/actions/toCamelCase/toCamelCase.d.ts
/**
* To camel case action interface.
*
* @beta
*/
export interface ToCamelCaseAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "to_camel_case";
	/**
	* The action reference.
	*/
	readonly reference: typeof toCamelCase;
}
declare function toCamelCase(): ToCamelCaseAction;
//#endregion
//#region src/actions/toDate/toDate.d.ts
/**
* To date issue interface.
*/
export interface ToDateIssue<TInput$1> extends BaseIssue<TInput$1 | Date> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "to_date";
	/**
	* The expected property.
	*/
	readonly expected: null;
}
/**
* To date action interface.
*/
export interface ToDateAction<TInput$1, TMessage extends ErrorMessage<ToDateIssue<TInput$1>> | undefined> extends BaseTransformation<TInput$1, Date, ToDateIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "to_date";
	/**
	* The action reference.
	*/
	readonly reference: typeof toDate;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function toDate<TInput$1>(): ToDateAction<TInput$1, undefined>;
declare function toDate<TInput$1, const TMessage extends ErrorMessage<ToDateIssue<TInput$1>> | undefined>(message: TMessage): ToDateAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/toKebabCase/toKebabCase.d.ts
/**
* To kebab case action interface.
*
* @beta
*/
export interface ToKebabCaseAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "to_kebab_case";
	/**
	* The action reference.
	*/
	readonly reference: typeof toKebabCase;
}
declare function toKebabCase(): ToKebabCaseAction;
//#endregion
//#region src/actions/toLowerCase/toLowerCase.d.ts
/**
* To lower case action interface.
*/
export interface ToLowerCaseAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "to_lower_case";
	/**
	* The action reference.
	*/
	readonly reference: typeof toLowerCase;
}
declare function toLowerCase(): ToLowerCaseAction;
//#endregion
//#region src/actions/toMaxValue/toMaxValue.d.ts
/**
* To max value action interface.
*/
export interface ToMaxValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1> extends BaseTransformation<TInput$1, TInput$1, never> {
	/**
	* The action type.
	*/
	readonly type: "to_max_value";
	/**
	* The action reference.
	*/
	readonly reference: typeof toMaxValue;
	/**
	* The maximum value.
	*/
	readonly requirement: TRequirement;
}
declare function toMaxValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): ToMaxValueAction<TInput$1, TRequirement>;
//#endregion
//#region src/actions/toMinValue/toMinValue.d.ts
/**
* To min value action interface.
*/
export interface ToMinValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1> extends BaseTransformation<TInput$1, TInput$1, never> {
	/**
	* The action type.
	*/
	readonly type: "to_min_value";
	/**
	* The action reference.
	*/
	readonly reference: typeof toMinValue;
	/**
	* The minimum value.
	*/
	readonly requirement: TRequirement;
}
declare function toMinValue<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): ToMinValueAction<TInput$1, TRequirement>;
//#endregion
//#region src/actions/toNumber/toNumber.d.ts
/**
* To number issue interface.
*/
export interface ToNumberIssue<TInput$1> extends BaseIssue<TInput$1 | number> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "to_number";
	/**
	* The expected property.
	*/
	readonly expected: null;
}
/**
* To number action interface.
*/
export interface ToNumberAction<TInput$1, TMessage extends ErrorMessage<ToNumberIssue<TInput$1>> | undefined> extends BaseTransformation<TInput$1, number, ToNumberIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "to_number";
	/**
	* The action reference.
	*/
	readonly reference: typeof toNumber;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function toNumber<TInput$1>(): ToNumberAction<TInput$1, undefined>;
declare function toNumber<TInput$1, const TMessage extends ErrorMessage<ToNumberIssue<TInput$1>> | undefined>(message: TMessage): ToNumberAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/toPascalCase/toPascalCase.d.ts
/**
* To pascal case action interface.
*
* @beta
*/
export interface ToPascalCaseAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "to_pascal_case";
	/**
	* The action reference.
	*/
	readonly reference: typeof toPascalCase;
}
declare function toPascalCase(): ToPascalCaseAction;
//#endregion
//#region src/actions/toSnakeCase/toSnakeCase.d.ts
/**
* To snake case action interface.
*
* @beta
*/
export interface ToSnakeCaseAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "to_snake_case";
	/**
	* The action reference.
	*/
	readonly reference: typeof toSnakeCase;
}
declare function toSnakeCase(): ToSnakeCaseAction;
//#endregion
//#region src/actions/toString/toString.d.ts
/**
* To string issue interface.
*/
export interface ToStringIssue<TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "transformation";
	/**
	* The issue type.
	*/
	readonly type: "to_string";
	/**
	* The expected property.
	*/
	readonly expected: null;
}
/**
* To string action interface.
*/
export interface ToStringAction<TInput$1, TMessage extends ErrorMessage<ToStringIssue<TInput$1>> | undefined> extends BaseTransformation<TInput$1, string, ToStringIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "to_string";
	/**
	* The action reference.
	*/
	readonly reference: typeof toString$1;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function toString$1<TInput$1>(): ToStringAction<TInput$1, undefined>;
declare function toString$1<TInput$1, const TMessage extends ErrorMessage<ToStringIssue<TInput$1>> | undefined>(message: TMessage): ToStringAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/toUpperCase/toUpperCase.d.ts
/**
* To upper case action interface.
*/
export interface ToUpperCaseAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "to_upper_case";
	/**
	* The action reference.
	*/
	readonly reference: typeof toUpperCase;
}
declare function toUpperCase(): ToUpperCaseAction;
//#endregion
//#region src/actions/transform/transform.d.ts
/**
* Transform action interface.
*/
export interface TransformAction<TInput$1, TOutput$1> extends BaseTransformation<TInput$1, TOutput$1, never> {
	/**
	* The action type.
	*/
	readonly type: "transform";
	/**
	* The action reference.
	*/
	readonly reference: typeof transform;
	/**
	* The transformation operation.
	*/
	readonly operation: (input: TInput$1) => TOutput$1;
}
declare function transform<TInput$1, TOutput$1>(operation: (input: TInput$1) => TOutput$1): TransformAction<TInput$1, TOutput$1>;
//#endregion
//#region src/actions/transform/transformAsync.d.ts
/**
* Transform action async interface.
*/
export interface TransformActionAsync<TInput$1, TOutput$1> extends BaseTransformationAsync<TInput$1, TOutput$1, never> {
	/**
	* The action type.
	*/
	readonly type: "transform";
	/**
	* The action reference.
	*/
	readonly reference: typeof transformAsync;
	/**
	* The transformation operation.
	*/
	readonly operation: (input: TInput$1) => Promise<TOutput$1>;
}
declare function transformAsync<TInput$1, TOutput$1>(operation: (input: TInput$1) => Promise<TOutput$1>): TransformActionAsync<TInput$1, TOutput$1>;
//#endregion
//#region src/actions/trim/trim.d.ts
/**
* Trim action interface.
*/
export interface TrimAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "trim";
	/**
	* The action reference.
	*/
	readonly reference: typeof trim;
}
declare function trim(): TrimAction;
//#endregion
//#region src/actions/trimEnd/trimEnd.d.ts
/**
* Trim end action interface.
*/
export interface TrimEndAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "trim_end";
	/**
	* The action reference.
	*/
	readonly reference: typeof trimEnd;
}
declare function trimEnd(): TrimEndAction;
//#endregion
//#region src/actions/trimStart/trimStart.d.ts
/**
* Trim start action interface.
*/
export interface TrimStartAction extends BaseTransformation<string, string, never> {
	/**
	* The action type.
	*/
	readonly type: "trim_start";
	/**
	* The action reference.
	*/
	readonly reference: typeof trimStart;
}
declare function trimStart(): TrimStartAction;
//#endregion
//#region src/actions/ulid/ulid.d.ts
/**
* ULID issue interface.
*/
export interface UlidIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "ulid";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The ULID regex.
	*/
	readonly requirement: RegExp;
}
/**
* ULID action interface.
*/
export interface UlidAction<TInput$1 extends string, TMessage extends ErrorMessage<UlidIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, UlidIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "ulid";
	/**
	* The action reference.
	*/
	readonly reference: typeof ulid;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The ULID regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function ulid<TInput$1 extends string>(): UlidAction<TInput$1, undefined>;
declare function ulid<TInput$1 extends string, const TMessage extends ErrorMessage<UlidIssue<TInput$1>> | undefined>(message: TMessage): UlidAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/url/url.d.ts
/**
* URL issue interface.
*/
export interface UrlIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "url";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
}
/**
* URL action interface.
*/
export interface UrlAction<TInput$1 extends string, TMessage extends ErrorMessage<UrlIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, UrlIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "url";
	/**
	* The action reference.
	*/
	readonly reference: typeof url;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The validation function.
	*/
	readonly requirement: (input: string) => boolean;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function url<TInput$1 extends string>(): UrlAction<TInput$1, undefined>;
declare function url<TInput$1 extends string, const TMessage extends ErrorMessage<UrlIssue<TInput$1>> | undefined>(message: TMessage): UrlAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/uuid/uuid.d.ts
/**
* UUID issue interface.
*/
export interface UuidIssue<TInput$1 extends string> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "uuid";
	/**
	* The expected property.
	*/
	readonly expected: null;
	/**
	* The received property.
	*/
	readonly received: `"${string}"`;
	/**
	* The UUID regex.
	*/
	readonly requirement: RegExp;
}
/**
* UUID action interface.
*/
export interface UuidAction<TInput$1 extends string, TMessage extends ErrorMessage<UuidIssue<TInput$1>> | undefined> extends BaseValidation<TInput$1, TInput$1, UuidIssue<TInput$1>> {
	/**
	* The action type.
	*/
	readonly type: "uuid";
	/**
	* The action reference.
	*/
	readonly reference: typeof uuid;
	/**
	* The expected property.
	*/
	readonly expects: null;
	/**
	* The UUID regex.
	*/
	readonly requirement: RegExp;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function uuid<TInput$1 extends string>(): UuidAction<TInput$1, undefined>;
declare function uuid<TInput$1 extends string, const TMessage extends ErrorMessage<UuidIssue<TInput$1>> | undefined>(message: TMessage): UuidAction<TInput$1, TMessage>;
//#endregion
//#region src/actions/value/value.d.ts
/**
* Value issue interface.
*/
export interface ValueIssue<TInput$1 extends ValueInput, TRequirement extends TInput$1> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "value";
	/**
	* The expected property.
	*/
	readonly expected: string;
	/**
	* The required value.
	*/
	readonly requirement: TRequirement;
}
/**
* Value action interface.
*/
export interface ValueAction<TInput$1 extends ValueInput, TRequirement extends TInput$1, TMessage extends ErrorMessage<ValueIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, ValueIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "value";
	/**
	* The action reference.
	*/
	readonly reference: typeof value;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* The required value.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function value<TInput$1 extends ValueInput, const TRequirement extends TInput$1>(requirement: TRequirement): ValueAction<TInput$1, TRequirement, undefined>;
declare function value<TInput$1 extends ValueInput, const TRequirement extends TInput$1, const TMessage extends ErrorMessage<ValueIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): ValueAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/values/values.d.ts
/**
* Values issue type.
*/
export interface ValuesIssue<TInput$1 extends ValueInput, TRequirement extends readonly TInput$1[]> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "values";
	/**
	* The expected property.
	*/
	readonly expected: string;
	/**
	* The required values.
	*/
	readonly requirement: TRequirement;
}
/**
* Values action type.
*/
export interface ValuesAction<TInput$1 extends ValueInput, TRequirement extends readonly TInput$1[], TMessage extends ErrorMessage<ValuesIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, ValuesIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "values";
	/**
	* The action reference.
	*/
	readonly reference: typeof values;
	/**
	* The expected property.
	*/
	readonly expects: string;
	/**
	* The required values.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function values<TInput$1 extends ValueInput, const TRequirement extends readonly TInput$1[]>(requirement: TRequirement): ValuesAction<TInput$1, TRequirement, undefined>;
declare function values<TInput$1 extends ValueInput, const TRequirement extends readonly TInput$1[], const TMessage extends ErrorMessage<ValuesIssue<TInput$1, TRequirement>> | undefined>(requirement: TRequirement, message: TMessage): ValuesAction<TInput$1, TRequirement, TMessage>;
//#endregion
//#region src/actions/words/words.d.ts
/**
* Words issue interface.
*/
export interface WordsIssue<TInput$1 extends string, TRequirement extends number> extends BaseIssue<TInput$1> {
	/**
	* The issue kind.
	*/
	readonly kind: "validation";
	/**
	* The issue type.
	*/
	readonly type: "words";
	/**
	* The expected property.
	*/
	readonly expected: `${TRequirement}`;
	/**
	* The received property.
	*/
	readonly received: `${number}`;
	/**
	* The required words.
	*/
	readonly requirement: TRequirement;
}
/**
* Words action interface.
*/
export interface WordsAction<TInput$1 extends string, TLocales extends Intl.LocalesArgument, TRequirement extends number, TMessage extends ErrorMessage<WordsIssue<TInput$1, TRequirement>> | undefined> extends BaseValidation<TInput$1, TInput$1, WordsIssue<TInput$1, TRequirement>> {
	/**
	* The action type.
	*/
	readonly type: "words";
	/**
	* The action reference.
	*/
	readonly reference: typeof words;
	/**
	* The expected property.
	*/
	readonly expects: `${TRequirement}`;
	/**
	* The locales to be used.
	*/
	readonly locales: TLocales;
	/**
	* The required words.
	*/
	readonly requirement: TRequirement;
	/**
	* The error message.
	*/
	readonly message: TMessage;
}
declare function words<TInput$1 extends string, const TLocales extends Intl.LocalesArgument, const TRequirement extends number>(locales: TLocales, requirement: TRequirement): WordsAction<TInput$1, TLocales, TRequirement, undefined>;
declare function words<TInput$1 extends string, const TLocales extends Intl.LocalesArgument, const TRequirement extends number, const TMessage extends ErrorMessage<WordsIssue<TInput$1, TRequirement>> | undefined>(locales: TLocales, requirement: TRequirement, message: TMessage): WordsAction<TInput$1, TLocales, TRequirement, TMessage>;
declare const BASE64_REGEX: RegExp;
declare const BIC_REGEX: RegExp;
declare const CUID2_REGEX: RegExp;
declare const DECIMAL_REGEX: RegExp;
declare const DIGITS_REGEX: RegExp;
declare const DOMAIN_REGEX: RegExp;
declare const EMAIL_REGEX: RegExp;
declare const EMOJI_REGEX: RegExp;
declare const HEXADECIMAL_REGEX: RegExp;
declare const HEX_COLOR_REGEX: RegExp;
declare const IMEI_REGEX: RegExp;
declare const IPV4_REGEX: RegExp;
declare const IPV6_REGEX: RegExp;
declare const IP_REGEX: RegExp;
declare const ISO_DATE_REGEX: RegExp;
declare const ISO_DATE_TIME_REGEX: RegExp;
declare const ISO_DATE_TIME_SECOND_REGEX: RegExp;
declare const ISO_TIME_REGEX: RegExp;
declare const ISO_TIME_SECOND_REGEX: RegExp;
declare const ISO_TIMESTAMP_REGEX: RegExp;
declare const ISO_WEEK_REGEX: RegExp;
declare const JWS_COMPACT_REGEX: RegExp;
declare const ISRC_REGEX: RegExp;
declare const MAC48_REGEX: RegExp;
declare const MAC64_REGEX: RegExp;
declare const MAC_REGEX: RegExp;
declare const NANO_ID_REGEX: RegExp;
declare const OCTAL_REGEX: RegExp;
declare const RFC_EMAIL_REGEX: RegExp;
declare const SLUG_REGEX: RegExp;
declare const ULID_REGEX: RegExp;
declare const UUID_REGEX: RegExp;
//#endregion
//#region src/storages/globalConfig/globalConfig.d.ts
/**
* The global config type.
*/
export type GlobalConfig = Omit<Config<never>, "message">;
declare function setGlobalConfig(config: GlobalConfig): void;
declare function getGlobalConfig<const TIssue extends BaseIssue<unknown>>(config?: Config<TIssue>): Config<TIssue>;
declare function deleteGlobalConfig(): void;
declare function setGlobalMessage(message: ErrorMessage<BaseIssue<unknown>>, lang?: string): void;
declare function getGlobalMessage(lang?: string): ErrorMessage<BaseIssue<unknown>> | undefined;
declare function deleteGlobalMessage(lang?: string): void;
declare function setSchemaMessage(message: ErrorMessage<BaseIssue<unknown>>, lang?: string): void;
declare function getSchemaMessage(lang?: string): ErrorMessage<BaseIssue<unknown>> | undefined;
declare function deleteSchemaMessage(lang?: string): void;
//#endregion
//#region src/storages/specificMessage/specificMessage.d.ts
/**
* Reference type.
*/
export type Reference = (...args: any[]) => BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | BaseValidation<unknown, unknown, BaseIssue<unknown>> | BaseValidationAsync<unknown, unknown, BaseIssue<unknown>> | BaseTransformation<unknown, unknown, BaseIssue<unknown>> | BaseTransformationAsync<unknown, unknown, BaseIssue<unknown>>;
declare function setSpecificMessage<const TReference extends Reference>(reference: TReference, message: ErrorMessage<InferIssue<ReturnType<TReference>>>, lang?: string): void;
declare function getSpecificMessage<const TReference extends Reference>(reference: TReference, lang?: string): ErrorMessage<InferIssue<ReturnType<TReference>>> | undefined;
declare function deleteSpecificMessage(reference: Reference, lang?: string): void;
//#endregion
//#region src/utils/_addIssue/_addIssue.d.ts
/**
* Context type.
*/
export type Context = BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | BaseValidation<any, unknown, BaseIssue<unknown>> | BaseValidationAsync<any, unknown, BaseIssue<unknown>> | BaseTransformation<any, unknown, BaseIssue<unknown>> | BaseTransformationAsync<any, unknown, BaseIssue<unknown>>;
/**
* Other interface.
*/
export interface Other<TContext extends Context> {
	input?: unknown | undefined;
	expected?: string | undefined;
	received?: string | undefined;
	message?: ErrorMessage<InferIssue<TContext>> | undefined;
	path?: [
		IssuePathItem,
		...IssuePathItem[]
	] | undefined;
	issues?: [
		BaseIssue<InferInput<TContext>>,
		...BaseIssue<InferInput<TContext>>[]
	] | undefined;
}
declare function _addIssue<const TContext extends Context>(context: TContext & {
	expects?: string | null;
	requirement?: unknown;
	message?: ErrorMessage<Extract<InferIssue<TContext>, {
		type: TContext["type"];
	}>> | undefined;
}, label: string, dataset: UnknownDataset | OutputDataset<unknown, BaseIssue<unknown>>, config: Config<InferIssue<TContext>>, other?: Other<TContext>): void;
declare function _cloneDataset<TValue$1, TIssue extends BaseIssue<unknown>>(dataset: OutputDataset<TValue$1, TIssue>): OutputDataset<TValue$1, TIssue>;
declare function _formatCase(input: string, separator: string, capFirst: boolean, capRest: boolean): string;
declare function _getByteCount(input: string): number;
declare function _getGraphemeCount(input: string): number;
//#endregion
//#region src/utils/_getLastMetadata/_getLastMetadata.d.ts
/**
* Metadata action type.
*/
export type MetadataAction$1 = TitleAction<unknown, string> | DescriptionAction<unknown, string>;
/**
* Schema type.
*/
export type Schema$1 = BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> | SchemaWithPipe<readonly [
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	...(PipeItem<any, unknown, BaseIssue<unknown>> | MetadataAction$1)[]
]> | SchemaWithPipeAsync<readonly [
	(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>),
	...(PipeItem<any, unknown, BaseIssue<unknown>> | PipeItemAsync<any, unknown, BaseIssue<unknown>> | MetadataAction$1)[]
]>;
declare function _getLastMetadata(schema: Schema$1, type: "title" | "description"): string | undefined;
declare function _getStandardProps<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(context: TSchema): StandardProps<InferInput<TSchema>, InferOutput<TSchema>>;
declare function _getWordCount(locales: Intl.LocalesArgument, input: string): number;
declare function _isLuhnAlgo(input: string): boolean;
declare function _isValidObjectKey(object: object, key: string): boolean;
declare function _joinExpects(values: string[], separator: "&" | "|"): string;
declare function _stringify(input: unknown): string;
declare function entriesFromList<const TList extends readonly (string | number | symbol)[], const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(list: TList, schema: TSchema): Record<TList[number], TSchema>;
//#endregion
//#region src/utils/entriesFromObjects/entriesFromObjects.d.ts
/**
* Schema type.
*/
export type Schema = LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> | LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> | ObjectWithRestSchema<ObjectEntries, BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | ObjectWithRestSchemaAsync<ObjectEntriesAsync, BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ObjectWithRestIssue> | undefined> | StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined> | StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>;
/**
* Recursive merge type.
*/
export type RecursiveMerge<TSchemas extends readonly [
	Schema,
	...Schema[]
]> = TSchemas extends readonly [
	infer TFirstSchema extends Schema
] ? TFirstSchema["entries"] : TSchemas extends readonly [
	infer TFirstSchema extends Schema,
	...infer TRestSchemas extends readonly [
		Schema,
		...Schema[]
	]
] ? Merge<TFirstSchema["entries"], RecursiveMerge<TRestSchemas>> : never;
/**
* Merged entries types.
*/
export type MergedEntries<TSchemas extends readonly [
	Schema,
	...Schema[]
]> = Prettify<RecursiveMerge<TSchemas>>;
declare function entriesFromObjects<const TSchemas extends readonly [
	Schema,
	...Schema[]
]>(schemas: TSchemas): MergedEntries<TSchemas>;
declare function getDotPath(issue: BaseIssue<unknown>): string | null;
declare function getDotPath<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(issue: InferIssue<TSchema>): IssueDotPath<TSchema> | null;
declare function isOfKind<const TKind extends TObject["kind"], const TObject extends {
	kind: string;
}>(kind: TKind, object: TObject): object is Extract<TObject, {
	kind: TKind;
}>;
declare function isOfType<const TType extends TObject["type"], const TObject extends {
	type: string;
}>(type: TType, object: TObject): object is Extract<TObject, {
	type: TType;
}>;
declare function isValiError<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(error: unknown): error is ValiError<TSchema>;
declare class ValiError<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>> extends Error {
	/**
	* The error issues.
	*/
	readonly issues: [
		InferIssue<TSchema>,
		...InferIssue<TSchema>[]
	];
	/**
	* Creates a Valibot error with useful information.
	*
	* @param issues The error issues.
	*/
	constructor(issues: [
		InferIssue<TSchema>,
		...InferIssue<TSchema>[]
	]);
}
type Fallback$1<TSchema extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>> = MaybeReadonly$1<InferOutput$1<TSchema>> | ((dataset?: OutputDataset$1<InferOutput$1<TSchema>, InferIssue$1<TSchema>>, config?: Config$1<InferIssue$1<TSchema>>) => MaybeReadonly$1<InferOutput$1<TSchema>>);
type SchemaWithFallback$1<TSchema extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TFallback extends Fallback$1<TSchema>> = TSchema & {
	/**
	 * The fallback value.
	 */
	readonly fallback: TFallback;
};
type FallbackAsync$1<TSchema extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = MaybeReadonly$1<InferOutput$1<TSchema>> | ((dataset?: OutputDataset$1<InferOutput$1<TSchema>, InferIssue$1<TSchema>>, config?: Config$1<InferIssue$1<TSchema>>) => MaybePromise$1<MaybeReadonly$1<InferOutput$1<TSchema>>>);
type SchemaWithFallbackAsync$1<TSchema extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TFallback extends FallbackAsync$1<TSchema>> = Omit<TSchema, "async" | "~standard" | "~run"> & {
	/**
	 * The fallback value.
	 */
	readonly fallback: TFallback;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * The Standard Schema properties.
	 *
	 * @internal
	 */
	readonly "~standard": StandardProps$1<InferInput$1<TSchema>, InferOutput$1<TSchema>>;
	/**
	 * Parses unknown input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: UnknownDataset$1, config: Config$1<BaseIssue$1<unknown>>) => Promise<OutputDataset$1<InferOutput$1<TSchema>, InferIssue$1<TSchema>>>;
};
type SchemaWithPipe$1<TPipe extends readonly [
	BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>,
	...PipeItem$1<any, unknown, BaseIssue$1<unknown>>[]
]> = Omit<FirstTupleItem$1<TPipe>, "pipe" | "~standard" | "~run" | "~types"> & {
	/**
	 * The pipe items.
	 */
	readonly pipe: TPipe;
	/**
	 * The Standard Schema properties.
	 *
	 * @internal
	 */
	readonly "~standard": StandardProps$1<InferInput$1<FirstTupleItem$1<TPipe>>, InferOutput$1<LastTupleItem$1<TPipe>>>;
	/**
	 * Parses unknown input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: UnknownDataset$1, config: Config$1<BaseIssue$1<unknown>>) => OutputDataset$1<InferOutput$1<LastTupleItem$1<TPipe>>, InferIssue$1<TPipe[number]>>;
	/**
	 * The input, output and issue type.
	 *
	 * @internal
	 */
	readonly "~types"?: {
		readonly input: InferInput$1<FirstTupleItem$1<TPipe>>;
		readonly output: InferOutput$1<LastTupleItem$1<TPipe>>;
		readonly issue: InferIssue$1<TPipe[number]>;
	} | undefined;
};
type SchemaWithPipeAsync$1<TPipe extends readonly [
	(BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>),
	...(PipeItem$1<any, unknown, BaseIssue$1<unknown>> | PipeItemAsync$1<any, unknown, BaseIssue$1<unknown>>)[]
]> = Omit<FirstTupleItem$1<TPipe>, "async" | "pipe" | "~standard" | "~run" | "~types"> & {
	/**
	 * The pipe items.
	 */
	readonly pipe: TPipe;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * The Standard Schema properties.
	 *
	 * @internal
	 */
	readonly "~standard": StandardProps$1<InferInput$1<FirstTupleItem$1<TPipe>>, InferOutput$1<LastTupleItem$1<TPipe>>>;
	/**
	 * Parses unknown input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: UnknownDataset$1, config: Config$1<BaseIssue$1<unknown>>) => Promise<OutputDataset$1<InferOutput$1<LastTupleItem$1<TPipe>>, InferIssue$1<TPipe[number]>>>;
	/**
	 * The input, output and issue type.
	 *
	 * @internal
	 */
	readonly "~types"?: {
		readonly input: InferInput$1<FirstTupleItem$1<TPipe>>;
		readonly output: InferOutput$1<LastTupleItem$1<TPipe>>;
		readonly issue: InferIssue$1<TPipe[number]>;
	} | undefined;
};
interface TitleAction$1<TInput, TTitle extends string> extends BaseMetadata$1<TInput> {
	/**
	 * The action type.
	 */
	readonly type: "title";
	/**
	 * The action reference.
	 */
	readonly reference: typeof title$1;
	/**
	 * The title text.
	 */
	readonly title: TTitle;
}
declare function title$1<TInput, TTitle extends string>(title_: TTitle): TitleAction$1<TInput, TTitle>;
interface BaseMetadata$1<TInput> {
	/**
	 * The object kind.
	 */
	readonly kind: "metadata";
	/**
	 * The metadata type.
	 */
	readonly type: string;
	/**
	 * The metadata reference.
	 */
	readonly reference: (...args: any[]) => BaseMetadata$1<any>;
	/**
	 * The input, output and issue type.
	 *
	 * @internal
	 */
	readonly "~types"?: {
		readonly input: TInput;
		readonly output: TInput;
		readonly issue: never;
	} | undefined;
}
interface UnknownDataset$1 {
	/**
	 * Whether is's typed.
	 */
	typed?: false;
	/**
	 * The dataset value.
	 */
	value: unknown;
	/**
	 * The dataset issues.
	 */
	issues?: undefined;
}
interface SuccessDataset$1<TValue> {
	/**
	 * Whether is's typed.
	 */
	typed: true;
	/**
	 * The dataset value.
	 */
	value: TValue;
	/**
	 * The dataset issues.
	 */
	issues?: undefined;
}
interface PartialDataset$1<TValue, TIssue extends BaseIssue$1<unknown>> {
	/**
	 * Whether is's typed.
	 */
	typed: true;
	/**
	 * The dataset value.
	 */
	value: TValue;
	/**
	 * The dataset issues.
	 */
	issues: [
		TIssue,
		...TIssue[]
	];
}
interface FailureDataset$1<TIssue extends BaseIssue$1<unknown>> {
	/**
	 * Whether is's typed.
	 */
	typed: false;
	/**
	 * The dataset value.
	 */
	value: unknown;
	/**
	 * The dataset issues.
	 */
	issues: [
		TIssue,
		...TIssue[]
	];
}
type OutputDataset$1<TValue, TIssue extends BaseIssue$1<unknown>> = SuccessDataset$1<TValue> | PartialDataset$1<TValue, TIssue> | FailureDataset$1<TIssue>;
interface StandardProps$1<TInput, TOutput> {
	/**
	 * The version number of the standard.
	 */
	readonly version: 1;
	/**
	 * The vendor name of the schema library.
	 */
	readonly vendor: "valibot";
	/**
	 * Validates unknown input values.
	 */
	readonly validate: (value: unknown) => StandardResult$1<TOutput> | Promise<StandardResult$1<TOutput>>;
	/**
	 * Inferred types associated with the schema.
	 */
	readonly types?: StandardTypes$1<TInput, TOutput> | undefined;
}
type StandardResult$1<TOutput> = StandardSuccessResult$1<TOutput> | StandardFailureResult$1;
interface StandardSuccessResult$1<TOutput> {
	/**
	 * The typed output value.
	 */
	readonly value: TOutput;
	/**
	 * The non-existent issues.
	 */
	readonly issues?: undefined;
}
interface StandardFailureResult$1 {
	/**
	 * The issues of failed validation.
	 */
	readonly issues: readonly StandardIssue$1[];
}
interface StandardIssue$1 {
	/**
	 * The error message of the issue.
	 */
	readonly message: string;
	/**
	 * The path of the issue, if any.
	 */
	readonly path?: readonly (PropertyKey | StandardPathItem$1)[] | undefined;
}
interface StandardPathItem$1 {
	/**
	 * The key of the path item.
	 */
	readonly key: PropertyKey;
}
interface StandardTypes$1<TInput, TOutput> {
	/**
	 * The input type of the schema.
	 */
	readonly input: TInput;
	/**
	 * The output type of the schema.
	 */
	readonly output: TOutput;
}
interface BaseSchema$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> {
	/**
	 * The object kind.
	 */
	readonly kind: "schema";
	/**
	 * The schema type.
	 */
	readonly type: string;
	/**
	 * The schema reference.
	 */
	readonly reference: (...args: any[]) => BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>;
	/**
	 * The expected property.
	 */
	readonly expects: string;
	/**
	 * Whether it's async.
	 */
	readonly async: false;
	/**
	 * The Standard Schema properties.
	 *
	 * @internal
	 */
	readonly "~standard": StandardProps$1<TInput, TOutput>;
	/**
	 * Parses unknown input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: UnknownDataset$1, config: Config$1<BaseIssue$1<unknown>>) => OutputDataset$1<TOutput, TIssue>;
	/**
	 * The input, output and issue type.
	 *
	 * @internal
	 */
	readonly "~types"?: {
		readonly input: TInput;
		readonly output: TOutput;
		readonly issue: TIssue;
	} | undefined;
}
interface BaseSchemaAsync$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> extends Omit<BaseSchema$1<TInput, TOutput, TIssue>, "reference" | "async" | "~run"> {
	/**
	 * The schema reference.
	 */
	readonly reference: (...args: any[]) => BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * Parses unknown input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: UnknownDataset$1, config: Config$1<BaseIssue$1<unknown>>) => Promise<OutputDataset$1<TOutput, TIssue>>;
}
interface BaseTransformation$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> {
	/**
	 * The object kind.
	 */
	readonly kind: "transformation";
	/**
	 * The transformation type.
	 */
	readonly type: string;
	/**
	 * The transformation reference.
	 */
	readonly reference: (...args: any[]) => BaseTransformation$1<any, any, BaseIssue$1<unknown>>;
	/**
	 * Whether it's async.
	 */
	readonly async: false;
	/**
	 * Transforms known input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: SuccessDataset$1<TInput>, config: Config$1<BaseIssue$1<unknown>>) => OutputDataset$1<TOutput, BaseIssue$1<unknown> | TIssue>;
	/**
	 * The input, output and issue type.
	 *
	 * @internal
	 */
	readonly "~types"?: {
		readonly input: TInput;
		readonly output: TOutput;
		readonly issue: TIssue;
	} | undefined;
}
interface BaseTransformationAsync$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> extends Omit<BaseTransformation$1<TInput, TOutput, TIssue>, "reference" | "async" | "~run"> {
	/**
	 * The transformation reference.
	 */
	readonly reference: (...args: any[]) => BaseTransformation$1<any, any, BaseIssue$1<unknown>> | BaseTransformationAsync$1<any, any, BaseIssue$1<unknown>>;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * Transforms known input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: SuccessDataset$1<TInput>, config: Config$1<BaseIssue$1<unknown>>) => Promise<OutputDataset$1<TOutput, BaseIssue$1<unknown> | TIssue>>;
}
interface BaseValidation$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> {
	/**
	 * The object kind.
	 */
	readonly kind: "validation";
	/**
	 * The validation type.
	 */
	readonly type: string;
	/**
	 * The validation reference.
	 */
	readonly reference: (...args: any[]) => BaseValidation$1<any, any, BaseIssue$1<unknown>>;
	/**
	 * The expected property.
	 */
	readonly expects: string | null;
	/**
	 * Whether it's async.
	 */
	readonly async: false;
	/**
	 * Validates known input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: OutputDataset$1<TInput, BaseIssue$1<unknown>>, config: Config$1<BaseIssue$1<unknown>>) => OutputDataset$1<TOutput, BaseIssue$1<unknown> | TIssue>;
	/**
	 * The input, output and issue type.
	 *
	 * @internal
	 */
	readonly "~types"?: {
		readonly input: TInput;
		readonly output: TOutput;
		readonly issue: TIssue;
	} | undefined;
}
interface BaseValidationAsync$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> extends Omit<BaseValidation$1<TInput, TOutput, TIssue>, "reference" | "async" | "~run"> {
	/**
	 * The validation reference.
	 */
	readonly reference: (...args: any[]) => BaseValidation$1<any, any, BaseIssue$1<unknown>> | BaseValidationAsync$1<any, any, BaseIssue$1<unknown>>;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * Validates known input values.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly "~run": (dataset: OutputDataset$1<TInput, BaseIssue$1<unknown>>, config: Config$1<BaseIssue$1<unknown>>) => Promise<OutputDataset$1<TOutput, BaseIssue$1<unknown> | TIssue>>;
}
type InferInput$1<TItem extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>> | BaseValidation$1<any, unknown, BaseIssue$1<unknown>> | BaseValidationAsync$1<any, unknown, BaseIssue$1<unknown>> | BaseTransformation$1<any, unknown, BaseIssue$1<unknown>> | BaseTransformationAsync$1<any, unknown, BaseIssue$1<unknown>> | BaseMetadata$1<any>> = NonNullable<TItem["~types"]>["input"];
type InferOutput$1<TItem extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>> | BaseValidation$1<any, unknown, BaseIssue$1<unknown>> | BaseValidationAsync$1<any, unknown, BaseIssue$1<unknown>> | BaseTransformation$1<any, unknown, BaseIssue$1<unknown>> | BaseTransformationAsync$1<any, unknown, BaseIssue$1<unknown>> | BaseMetadata$1<any>> = NonNullable<TItem["~types"]>["output"];
type InferIssue$1<TItem extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>> | BaseValidation$1<any, unknown, BaseIssue$1<unknown>> | BaseValidationAsync$1<any, unknown, BaseIssue$1<unknown>> | BaseTransformation$1<any, unknown, BaseIssue$1<unknown>> | BaseTransformationAsync$1<any, unknown, BaseIssue$1<unknown>> | BaseMetadata$1<any>> = NonNullable<TItem["~types"]>["issue"];
type NonNullable$1$1<TValue> = TValue extends null ? never : TValue;
type NonNullish$1<TValue> = TValue extends null | undefined ? never : TValue;
type NonOptional$1<TValue> = TValue extends undefined ? never : TValue;
type MaybeReadonly$1<TValue> = TValue | Readonly<TValue>;
type MaybePromise$1<TValue> = TValue | Promise<TValue>;
type Prettify$1<TObject> = {
	[TKey in keyof TObject]: TObject[TKey];
} & {};
type MarkOptional$1<TObject, TKeys extends keyof TObject> = {
	[TKey in keyof TObject]?: unknown;
} & Omit<TObject, TKeys> & Partial<Pick<TObject, TKeys>>;
type FirstTupleItem$1<TTuple extends readonly [
	unknown,
	...unknown[]
]> = TTuple[0];
type LastTupleItem$1<TTuple extends readonly [
	unknown,
	...unknown[]
]> = TTuple[TTuple extends readonly [
	unknown,
	...infer TRest
] ? TRest["length"] : never];
type ErrorMessage$1<TIssue extends BaseIssue$1<unknown>> = ((issue: TIssue) => string) | string;
type Default$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TInput extends null | undefined> = MaybeReadonly$1<InferInput$1<TWrapped> | TInput> | ((dataset?: UnknownDataset$1, config?: Config$1<InferIssue$1<TWrapped>>) => MaybeReadonly$1<InferInput$1<TWrapped> | TInput>) | undefined;
type DefaultAsync$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TInput extends null | undefined> = MaybeReadonly$1<InferInput$1<TWrapped> | TInput> | ((dataset?: UnknownDataset$1, config?: Config$1<InferIssue$1<TWrapped>>) => MaybePromise$1<MaybeReadonly$1<InferInput$1<TWrapped> | TInput>>) | undefined;
type DefaultValue$1<TDefault extends Default$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, null | undefined> | DefaultAsync$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, null | undefined>> = TDefault extends DefaultAsync$1<infer TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, infer TInput> ? TDefault extends (dataset?: UnknownDataset$1, config?: Config$1<InferIssue$1<TWrapped>>) => MaybePromise$1<InferInput$1<TWrapped> | TInput> ? Awaited<ReturnType<TDefault>> : TDefault : never;
type OptionalEntrySchema$1 = ExactOptionalSchema$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, unknown> | NullishSchema$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, unknown> | OptionalSchema$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, unknown>;
type OptionalEntrySchemaAsync$1 = ExactOptionalSchemaAsync$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, unknown> | NullishSchemaAsync$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, unknown> | OptionalSchemaAsync$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, unknown>;
interface ObjectEntries$1 {
	[key: string]: BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | SchemaWithFallback$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, unknown> | OptionalEntrySchema$1;
}
interface ObjectEntriesAsync$1 {
	[key: string]: BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>> | SchemaWithFallback$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, unknown> | SchemaWithFallbackAsync$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, unknown> | OptionalEntrySchema$1 | OptionalEntrySchemaAsync$1;
}
type InferEntriesInput$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = {
	-readonly [TKey in keyof TEntries]: InferInput$1<TEntries[TKey]>;
};
type InferEntriesOutput$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = {
	-readonly [TKey in keyof TEntries]: InferOutput$1<TEntries[TKey]>;
};
type OptionalInputKeys$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = {
	[TKey in keyof TEntries]: TEntries[TKey] extends OptionalEntrySchema$1 | OptionalEntrySchemaAsync$1 ? TKey : never;
}[keyof TEntries];
type OptionalOutputKeys$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = {
	[TKey in keyof TEntries]: TEntries[TKey] extends OptionalEntrySchema$1 | OptionalEntrySchemaAsync$1 ? undefined extends TEntries[TKey]["default"] ? TKey : never : never;
}[keyof TEntries];
type InputWithQuestionMarks$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1, TObject extends InferEntriesInput$1<TEntries>> = MarkOptional$1<TObject, OptionalInputKeys$1<TEntries>>;
type OutputWithQuestionMarks$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1, TObject extends InferEntriesOutput$1<TEntries>> = MarkOptional$1<TObject, OptionalOutputKeys$1<TEntries>>;
type ReadonlyOutputKeys$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = {
	[TKey in keyof TEntries]: TEntries[TKey] extends SchemaWithPipe$1<infer TPipe> | SchemaWithPipeAsync$1<infer TPipe> ? ReadonlyAction$1<any> extends TPipe[number] ? TKey : never : never;
}[keyof TEntries];
type OutputWithReadonly$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1, TObject extends OutputWithQuestionMarks$1<TEntries, InferEntriesOutput$1<TEntries>>> = Readonly<TObject> & Pick<TObject, Exclude<keyof TObject, ReadonlyOutputKeys$1<TEntries>>>;
type InferObjectInput$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = Prettify$1<InputWithQuestionMarks$1<TEntries, InferEntriesInput$1<TEntries>>>;
type InferObjectOutput$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = Prettify$1<OutputWithReadonly$1<TEntries, OutputWithQuestionMarks$1<TEntries, InferEntriesOutput$1<TEntries>>>>;
type InferObjectIssue$1<TEntries extends ObjectEntries$1 | ObjectEntriesAsync$1> = InferIssue$1<TEntries[keyof TEntries]>;
type TupleItems$1 = MaybeReadonly$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>[]>;
type TupleItemsAsync$1 = MaybeReadonly$1<(BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>)[]>;
type InferTupleInput$1<TItems extends TupleItems$1 | TupleItemsAsync$1> = {
	-readonly [TKey in keyof TItems]: InferInput$1<TItems[TKey]>;
};
type InferTupleOutput$1<TItems extends TupleItems$1 | TupleItemsAsync$1> = {
	-readonly [TKey in keyof TItems]: InferOutput$1<TItems[TKey]>;
};
type InferTupleIssue$1<TItems extends TupleItems$1 | TupleItemsAsync$1> = InferIssue$1<TItems[number]>;
interface ArrayPathItem$1 {
	/**
	 * The path item type.
	 */
	readonly type: "array";
	/**
	 * The path item origin.
	 */
	readonly origin: "value";
	/**
	 * The path item input.
	 */
	readonly input: MaybeReadonly$1<unknown[]>;
	/**
	 * The path item key.
	 */
	readonly key: number;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}
interface MapPathItem$1 {
	/**
	 * The path item type.
	 */
	readonly type: "map";
	/**
	 * The path item origin.
	 */
	readonly origin: "key" | "value";
	/**
	 * The path item input.
	 */
	readonly input: Map<unknown, unknown>;
	/**
	 * The path item key.
	 */
	readonly key: unknown;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}
interface ObjectPathItem$1 {
	/**
	 * The path item type.
	 */
	readonly type: "object";
	/**
	 * The path item origin.
	 */
	readonly origin: "key" | "value";
	/**
	 * The path item input.
	 */
	readonly input: Record<string, unknown>;
	/**
	 * The path item key.
	 */
	readonly key: string;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}
interface SetPathItem$1 {
	/**
	 * The path item type.
	 */
	readonly type: "set";
	/**
	 * The path item origin.
	 */
	readonly origin: "value";
	/**
	 * The path item input.
	 */
	readonly input: Set<unknown>;
	/**
	 * The path item key.
	 */
	readonly key: null;
	/**
	 * The path item key.
	 */
	readonly value: unknown;
}
interface UnknownPathItem$1 {
	/**
	 * The path item type.
	 */
	readonly type: "unknown";
	/**
	 * The path item origin.
	 */
	readonly origin: "key" | "value";
	/**
	 * The path item input.
	 */
	readonly input: unknown;
	/**
	 * The path item key.
	 */
	readonly key: unknown;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}
type IssuePathItem$1 = ArrayPathItem$1 | MapPathItem$1 | ObjectPathItem$1 | SetPathItem$1 | UnknownPathItem$1;
interface BaseIssue$1<TInput> extends Config$1<BaseIssue$1<TInput>> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema" | "validation" | "transformation";
	/**
	 * The issue type.
	 */
	readonly type: string;
	/**
	 * The raw input data.
	 */
	readonly input: TInput;
	/**
	 * The expected property.
	 */
	readonly expected: string | null;
	/**
	 * The received property.
	 */
	readonly received: string;
	/**
	 * The error message.
	 */
	readonly message: string;
	/**
	 * The input requirement.
	 */
	readonly requirement?: unknown | undefined;
	/**
	 * The issue path.
	 */
	readonly path?: [
		IssuePathItem$1,
		...IssuePathItem$1[]
	] | undefined;
	/**
	 * The sub issues.
	 */
	readonly issues?: [
		BaseIssue$1<TInput>,
		...BaseIssue$1<TInput>[]
	] | undefined;
}
interface Config$1<TIssue extends BaseIssue$1<unknown>> {
	/**
	 * The selected language.
	 */
	readonly lang?: string | undefined;
	/**
	 * The error message.
	 */
	readonly message?: ErrorMessage$1<TIssue> | undefined;
	/**
	 * Whether it should be aborted early.
	 */
	readonly abortEarly?: boolean | undefined;
	/**
	 * Whether a pipe should be aborted early.
	 */
	readonly abortPipeEarly?: boolean | undefined;
}
type PipeAction$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> = BaseValidation$1<TInput, TOutput, TIssue> | BaseTransformation$1<TInput, TOutput, TIssue> | BaseMetadata$1<TInput>;
type PipeActionAsync$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> = BaseValidationAsync$1<TInput, TOutput, TIssue> | BaseTransformationAsync$1<TInput, TOutput, TIssue>;
type PipeItem$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> = BaseSchema$1<TInput, TOutput, TIssue> | PipeAction$1<TInput, TOutput, TIssue>;
type PipeItemAsync$1<TInput, TOutput, TIssue extends BaseIssue$1<unknown>> = BaseSchemaAsync$1<TInput, TOutput, TIssue> | PipeActionAsync$1<TInput, TOutput, TIssue>;
type SchemaWithoutPipe$1<TSchema extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = TSchema & {
	pipe?: never;
};
interface AnySchema$1 extends BaseSchema$1<any, any, never> {
	/**
	 * The schema type.
	 */
	readonly type: "any";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof any$1;
	/**
	 * The expected property.
	 */
	readonly expects: "any";
}
declare function any$1(): AnySchema$1;
interface ArrayIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "array";
	/**
	 * The expected property.
	 */
	readonly expected: "Array";
}
interface ArraySchema$1<TItem extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<ArrayIssue$1> | undefined> extends BaseSchema$1<InferInput$1<TItem>[], InferOutput$1<TItem>[], ArrayIssue$1 | InferIssue$1<TItem>> {
	/**
	 * The schema type.
	 */
	readonly type: "array";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof array$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The array item schema.
	 */
	readonly item: TItem;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function array$1<const TItem extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(item: TItem): ArraySchema$1<TItem, undefined>;
declare function array$1<const TItem extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<ArrayIssue$1> | undefined>(item: TItem, message: TMessage): ArraySchema$1<TItem, TMessage>;
interface BooleanIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "boolean";
	/**
	 * The expected property.
	 */
	readonly expected: "boolean";
}
interface BooleanSchema$1<TMessage extends ErrorMessage$1<BooleanIssue$1> | undefined> extends BaseSchema$1<boolean, boolean, BooleanIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "boolean";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof boolean$1;
	/**
	 * The expected property.
	 */
	readonly expects: "boolean";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function boolean$1(): BooleanSchema$1<undefined>;
declare function boolean$1<const TMessage extends ErrorMessage$1<BooleanIssue$1> | undefined>(message: TMessage): BooleanSchema$1<TMessage>;
interface CustomIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "custom";
	/**
	 * The expected property.
	 */
	readonly expected: "unknown";
}
type Check$1 = (input: unknown) => boolean;
interface CustomSchema$1<TInput, TMessage extends ErrorMessage$1<CustomIssue$1> | undefined> extends BaseSchema$1<TInput, TInput, CustomIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "custom";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof custom$1;
	/**
	 * The expected property.
	 */
	readonly expects: "unknown";
	/**
	 * The type check function.
	 */
	readonly check: Check$1;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function custom$1<TInput>(check: Check$1): CustomSchema$1<TInput, undefined>;
declare function custom$1<TInput, const TMessage extends ErrorMessage$1<CustomIssue$1> | undefined = ErrorMessage$1<CustomIssue$1> | undefined>(check: Check$1, message: TMessage): CustomSchema$1<TInput, TMessage>;
interface Enum$1 {
	[key: string]: string | number;
}
type EnumValues$1<TEnum extends Enum$1> = {
	[TKey in keyof TEnum]: TKey extends number ? TEnum[TKey] extends string ? TEnum[TEnum[TKey]] extends TKey ? never : TEnum[TKey] : TEnum[TKey] : TKey extends "NaN" | "Infinity" | "-Infinity" ? TEnum[TKey] extends string ? TEnum[TEnum[TKey]] extends number ? never : TEnum[TKey] : TEnum[TKey] : TKey extends `+${number}` ? TEnum[TKey] : TKey extends `${infer TNumber extends number}` ? TEnum[TKey] extends string ? TEnum[TEnum[TKey]] extends TNumber ? never : TEnum[TKey] : TEnum[TKey] : TEnum[TKey];
}[keyof TEnum];
interface EnumIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "enum";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}
interface EnumSchema$1<TEnum extends Enum$1, TMessage extends ErrorMessage$1<EnumIssue$1> | undefined> extends BaseSchema$1<EnumValues$1<TEnum>, EnumValues$1<TEnum>, EnumIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "enum";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof enum_$1;
	/**
	 * The enum object.
	 */
	readonly enum: TEnum;
	/**
	 * The enum options.
	 */
	readonly options: EnumValues$1<TEnum>[];
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function enum_$1<const TEnum extends Enum$1>(enum__: TEnum): EnumSchema$1<TEnum, undefined>;
declare function enum_$1<const TEnum extends Enum$1, const TMessage extends ErrorMessage$1<EnumIssue$1> | undefined>(enum__: TEnum, message: TMessage): EnumSchema$1<TEnum, TMessage>;
interface ExactOptionalSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends Default$1<TWrapped, never>> extends BaseSchema$1<InferInput$1<TWrapped>, InferOutput$1<TWrapped>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "exact_optional";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof exactOptional$1;
	/**
	 * The expected property.
	 */
	readonly expects: TWrapped["expects"];
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function exactOptional$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): ExactOptionalSchema$1<TWrapped, undefined>;
declare function exactOptional$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends Default$1<TWrapped, never>>(wrapped: TWrapped, default_: TDefault): ExactOptionalSchema$1<TWrapped, TDefault>;
interface ExactOptionalSchemaAsync$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends DefaultAsync$1<TWrapped, never>> extends BaseSchemaAsync$1<InferInput$1<TWrapped>, InferOutput$1<TWrapped>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "exact_optional";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof exactOptional$1 | typeof exactOptionalAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: TWrapped["expects"];
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function exactOptionalAsync$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): ExactOptionalSchemaAsync$1<TWrapped, undefined>;
declare function exactOptionalAsync$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends DefaultAsync$1<TWrapped, never>>(wrapped: TWrapped, default_: TDefault): ExactOptionalSchemaAsync$1<TWrapped, TDefault>;
interface IntersectIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "intersect";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}
type IntersectOptions$1 = MaybeReadonly$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>[]>;
type IntersectOptionsAsync$1 = MaybeReadonly$1<(BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>)[]>;
type InferOption$1<TInput, TOutput> = BaseSchema$1<TInput, TOutput, BaseIssue$1<unknown>> | BaseSchemaAsync$1<TInput, TOutput, BaseIssue$1<unknown>>;
type InferIntersectInput$1<TOptions extends IntersectOptions$1 | IntersectOptionsAsync$1> = TOptions extends readonly [
	InferOption$1<infer TInput, unknown>,
	...infer TRest
] ? TRest extends readonly [
	InferOption$1<unknown, unknown>,
	...InferOption$1<unknown, unknown>[]
] ? TInput & InferIntersectInput$1<TRest> : TInput : never;
type InferIntersectOutput$1<TOptions extends IntersectOptions$1 | IntersectOptionsAsync$1> = TOptions extends readonly [
	InferOption$1<unknown, infer TOutput>,
	...infer TRest
] ? TRest extends readonly [
	InferOption$1<unknown, unknown>,
	...InferOption$1<unknown, unknown>[]
] ? TOutput & InferIntersectOutput$1<TRest> : TOutput : never;
interface IntersectSchema$1<TOptions extends IntersectOptions$1, TMessage extends ErrorMessage$1<IntersectIssue$1> | undefined> extends BaseSchema$1<InferIntersectInput$1<TOptions>, InferIntersectOutput$1<TOptions>, IntersectIssue$1 | InferIssue$1<TOptions[number]>> {
	/**
	 * The schema type.
	 */
	readonly type: "intersect";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof intersect$1;
	/**
	 * The intersect options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function intersect$1<const TOptions extends IntersectOptions$1>(options: TOptions): IntersectSchema$1<TOptions, undefined>;
declare function intersect$1<const TOptions extends IntersectOptions$1, const TMessage extends ErrorMessage$1<IntersectIssue$1> | undefined>(options: TOptions, message: TMessage): IntersectSchema$1<TOptions, TMessage>;
interface LazySchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>> extends BaseSchema$1<InferInput$1<TWrapped>, InferOutput$1<TWrapped>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "lazy";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof lazy$1;
	/**
	 * The expected property.
	 */
	readonly expects: "unknown";
	/**
	 * The schema getter.
	 */
	readonly getter: (input: unknown) => TWrapped;
}
declare function lazy$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(getter: (input: unknown) => TWrapped): LazySchema$1<TWrapped>;
type Literal$1 = bigint | boolean | number | string | symbol;
interface LiteralIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "literal";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}
interface LiteralSchema$1<TLiteral extends Literal$1, TMessage extends ErrorMessage$1<LiteralIssue$1> | undefined> extends BaseSchema$1<TLiteral, TLiteral, LiteralIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "literal";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof literal$1;
	/**
	 * The literal value.
	 */
	readonly literal: TLiteral;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function literal$1<const TLiteral extends Literal$1>(literal_: TLiteral): LiteralSchema$1<TLiteral, undefined>;
declare function literal$1<const TLiteral extends Literal$1, const TMessage extends ErrorMessage$1<LiteralIssue$1> | undefined>(literal_: TLiteral, message: TMessage): LiteralSchema$1<TLiteral, TMessage>;
interface LooseObjectIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "loose_object";
	/**
	 * The expected property.
	 */
	readonly expected: "Object" | `"${string}"`;
}
interface LooseObjectSchema$1<TEntries extends ObjectEntries$1, TMessage extends ErrorMessage$1<LooseObjectIssue$1> | undefined> extends BaseSchema$1<InferObjectInput$1<TEntries> & {
	[key: string]: unknown;
}, InferObjectOutput$1<TEntries> & {
	[key: string]: unknown;
}, LooseObjectIssue$1 | InferObjectIssue$1<TEntries>> {
	/**
	 * The schema type.
	 */
	readonly type: "loose_object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof looseObject$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function looseObject$1<const TEntries extends ObjectEntries$1>(entries: TEntries): LooseObjectSchema$1<TEntries, undefined>;
declare function looseObject$1<const TEntries extends ObjectEntries$1, const TMessage extends ErrorMessage$1<LooseObjectIssue$1> | undefined>(entries: TEntries, message: TMessage): LooseObjectSchema$1<TEntries, TMessage>;
interface LooseObjectSchemaAsync$1<TEntries extends ObjectEntriesAsync$1, TMessage extends ErrorMessage$1<LooseObjectIssue$1> | undefined> extends BaseSchemaAsync$1<InferObjectInput$1<TEntries> & {
	[key: string]: unknown;
}, InferObjectOutput$1<TEntries> & {
	[key: string]: unknown;
}, LooseObjectIssue$1 | InferObjectIssue$1<TEntries>> {
	/**
	 * The schema type.
	 */
	readonly type: "loose_object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof looseObject$1 | typeof looseObjectAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function looseObjectAsync$1<const TEntries extends ObjectEntriesAsync$1>(entries: TEntries): LooseObjectSchemaAsync$1<TEntries, undefined>;
declare function looseObjectAsync$1<const TEntries extends ObjectEntriesAsync$1, const TMessage extends ErrorMessage$1<LooseObjectIssue$1> | undefined>(entries: TEntries, message: TMessage): LooseObjectSchemaAsync$1<TEntries, TMessage>;
interface LooseTupleIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "loose_tuple";
	/**
	 * The expected property.
	 */
	readonly expected: "Array";
}
interface LooseTupleSchema$1<TItems extends TupleItems$1, TMessage extends ErrorMessage$1<LooseTupleIssue$1> | undefined> extends BaseSchema$1<[
	...InferTupleInput$1<TItems>,
	...unknown[]
], [
	...InferTupleOutput$1<TItems>,
	...unknown[]
], LooseTupleIssue$1 | InferTupleIssue$1<TItems>> {
	/**
	 * The schema type.
	 */
	readonly type: "loose_tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof looseTuple$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The items schema.
	 */
	readonly items: TItems;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function looseTuple$1<const TItems extends TupleItems$1>(items: TItems): LooseTupleSchema$1<TItems, undefined>;
declare function looseTuple$1<const TItems extends TupleItems$1, const TMessage extends ErrorMessage$1<LooseTupleIssue$1> | undefined>(items: TItems, message: TMessage): LooseTupleSchema$1<TItems, TMessage>;
interface NeverIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "never";
	/**
	 * The expected property.
	 */
	readonly expected: "never";
}
interface NeverSchema$1<TMessage extends ErrorMessage$1<NeverIssue$1> | undefined> extends BaseSchema$1<never, never, NeverIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "never";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof never$1;
	/**
	 * The expected property.
	 */
	readonly expects: "never";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function never$1(): NeverSchema$1<undefined>;
declare function never$1<const TMessage extends ErrorMessage$1<NeverIssue$1> | undefined>(message: TMessage): NeverSchema$1<TMessage>;
interface UnionIssue$1<TSubIssue extends BaseIssue$1<unknown>> extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "union";
	/**
	 * The expected property.
	 */
	readonly expected: string;
	/**
	 * The sub issues.
	 */
	readonly issues?: [
		TSubIssue,
		...TSubIssue[]
	];
}
type UnionOptions$1 = MaybeReadonly$1<BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>[]>;
interface UnionSchema$1<TOptions extends UnionOptions$1, TMessage extends ErrorMessage$1<UnionIssue$1<InferIssue$1<TOptions[number]>>> | undefined> extends BaseSchema$1<InferInput$1<TOptions[number]>, InferOutput$1<TOptions[number]>, UnionIssue$1<InferIssue$1<TOptions[number]>> | InferIssue$1<TOptions[number]>> {
	/**
	 * The schema type.
	 */
	readonly type: "union";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof union$1;
	/**
	 * The union options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function union$1<const TOptions extends UnionOptions$1>(options: TOptions): UnionSchema$1<TOptions, undefined>;
declare function union$1<const TOptions extends UnionOptions$1, const TMessage extends ErrorMessage$1<UnionIssue$1<InferIssue$1<TOptions[number]>>> | undefined>(options: TOptions, message: TMessage): UnionSchema$1<TOptions, TMessage>;
type UnionOptionsAsync$1 = MaybeReadonly$1<(BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>)[]>;
interface UnionSchemaAsync$1<TOptions extends UnionOptionsAsync$1, TMessage extends ErrorMessage$1<UnionIssue$1<InferIssue$1<TOptions[number]>>> | undefined> extends BaseSchemaAsync$1<InferInput$1<TOptions[number]>, InferOutput$1<TOptions[number]>, UnionIssue$1<InferIssue$1<TOptions[number]>> | InferIssue$1<TOptions[number]>> {
	/**
	 * The schema type.
	 */
	readonly type: "union";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof union$1 | typeof unionAsync$1;
	/**
	 * The union options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function unionAsync$1<const TOptions extends UnionOptionsAsync$1>(options: TOptions): UnionSchemaAsync$1<TOptions, undefined>;
declare function unionAsync$1<const TOptions extends UnionOptionsAsync$1, const TMessage extends ErrorMessage$1<UnionIssue$1<InferIssue$1<TOptions[number]>>> | undefined>(options: TOptions, message: TMessage): UnionSchemaAsync$1<TOptions, TMessage>;
interface NonNullableIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "non_nullable";
	/**
	 * The expected property.
	 */
	readonly expected: "!null";
}
type InferNonNullableInput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = NonNullable$1$1<InferInput$1<TWrapped>>;
type InferNonNullableOutput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = NonNullable$1$1<InferOutput$1<TWrapped>>;
type InferNonNullableIssue$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = TWrapped extends UnionSchema$1<UnionOptions$1, ErrorMessage$1<UnionIssue$1<BaseIssue$1<unknown>>> | undefined> | UnionSchemaAsync$1<UnionOptionsAsync$1, ErrorMessage$1<UnionIssue$1<BaseIssue$1<unknown>>> | undefined> ? Exclude<InferIssue$1<TWrapped>, {
	type: "null" | "union";
}> | UnionIssue$1<InferNonNullableIssue$1<TWrapped["options"][number]>> : Exclude<InferIssue$1<TWrapped>, {
	type: "null";
}>;
interface NonNullableSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<NonNullableIssue$1> | undefined> extends BaseSchema$1<InferNonNullableInput$1<TWrapped>, InferNonNullableOutput$1<TWrapped>, NonNullableIssue$1 | InferNonNullableIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "non_nullable";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof nonNullable$1;
	/**
	 * The expected property.
	 */
	readonly expects: "!null";
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function nonNullable$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): NonNullableSchema$1<TWrapped, undefined>;
declare function nonNullable$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<NonNullableIssue$1> | undefined>(wrapped: TWrapped, message: TMessage): NonNullableSchema$1<TWrapped, TMessage>;
interface NonNullishIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "non_nullish";
	/**
	 * The expected property.
	 */
	readonly expected: "(!null & !undefined)";
}
type InferNonNullishInput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = NonNullish$1<InferInput$1<TWrapped>>;
type InferNonNullishOutput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = NonNullish$1<InferOutput$1<TWrapped>>;
type InferNonNullishIssue$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = TWrapped extends UnionSchema$1<UnionOptions$1, ErrorMessage$1<UnionIssue$1<BaseIssue$1<unknown>>> | undefined> | UnionSchemaAsync$1<UnionOptionsAsync$1, ErrorMessage$1<UnionIssue$1<BaseIssue$1<unknown>>> | undefined> ? Exclude<InferIssue$1<TWrapped>, {
	type: "null" | "undefined" | "union";
}> | UnionIssue$1<InferNonNullishIssue$1<TWrapped["options"][number]>> : Exclude<InferIssue$1<TWrapped>, {
	type: "null" | "undefined";
}>;
interface NonNullishSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<NonNullishIssue$1> | undefined> extends BaseSchema$1<InferNonNullishInput$1<TWrapped>, InferNonNullishOutput$1<TWrapped>, NonNullishIssue$1 | InferNonNullishIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "non_nullish";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof nonNullish$1;
	/**
	 * The expected property.
	 */
	readonly expects: "(!null & !undefined)";
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function nonNullish$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): NonNullishSchema$1<TWrapped, undefined>;
declare function nonNullish$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<NonNullishIssue$1> | undefined>(wrapped: TWrapped, message: TMessage): NonNullishSchema$1<TWrapped, TMessage>;
interface NonOptionalIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "non_optional";
	/**
	 * The expected property.
	 */
	readonly expected: "!undefined";
}
type InferNonOptionalInput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = NonOptional$1<InferInput$1<TWrapped>>;
type InferNonOptionalOutput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = NonOptional$1<InferOutput$1<TWrapped>>;
type InferNonOptionalIssue$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = TWrapped extends UnionSchema$1<UnionOptions$1, ErrorMessage$1<UnionIssue$1<BaseIssue$1<unknown>>> | undefined> | UnionSchemaAsync$1<UnionOptionsAsync$1, ErrorMessage$1<UnionIssue$1<BaseIssue$1<unknown>>> | undefined> ? Exclude<InferIssue$1<TWrapped>, {
	type: "undefined" | "union";
}> | UnionIssue$1<InferNonOptionalIssue$1<TWrapped["options"][number]>> : Exclude<InferIssue$1<TWrapped>, {
	type: "undefined";
}>;
interface NonOptionalSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<NonOptionalIssue$1> | undefined> extends BaseSchema$1<InferNonOptionalInput$1<TWrapped>, InferNonOptionalOutput$1<TWrapped>, NonOptionalIssue$1 | InferNonOptionalIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "non_optional";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof nonOptional$1;
	/**
	 * The expected property.
	 */
	readonly expects: "!undefined";
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function nonOptional$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): NonOptionalSchema$1<TWrapped, undefined>;
declare function nonOptional$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<NonOptionalIssue$1> | undefined>(wrapped: TWrapped, message: TMessage): NonOptionalSchema$1<TWrapped, TMessage>;
interface NullIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "null";
	/**
	 * The expected property.
	 */
	readonly expected: "null";
}
interface NullSchema$1<TMessage extends ErrorMessage$1<NullIssue$1> | undefined> extends BaseSchema$1<null, null, NullIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "null";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof null_$1;
	/**
	 * The expected property.
	 */
	readonly expects: "null";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function null_$1(): NullSchema$1<undefined>;
declare function null_$1<const TMessage extends ErrorMessage$1<NullIssue$1> | undefined>(message: TMessage): NullSchema$1<TMessage>;
type InferNullableOutput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends DefaultAsync$1<TWrapped, null>> = undefined extends TDefault ? InferOutput$1<TWrapped> | null : InferOutput$1<TWrapped> | Extract<DefaultValue$1<TDefault>, null>;
interface NullableSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends Default$1<TWrapped, null>> extends BaseSchema$1<InferInput$1<TWrapped> | null, InferNullableOutput$1<TWrapped, TDefault>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "nullable";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof nullable$1;
	/**
	 * The expected property.
	 */
	readonly expects: `(${TWrapped["expects"]} | null)`;
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function nullable$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): NullableSchema$1<TWrapped, undefined>;
declare function nullable$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends Default$1<TWrapped, null>>(wrapped: TWrapped, default_: TDefault): NullableSchema$1<TWrapped, TDefault>;
type InferNullishOutput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends DefaultAsync$1<TWrapped, null | undefined>> = undefined extends TDefault ? InferOutput$1<TWrapped> | null | undefined : InferOutput$1<TWrapped> | Extract<DefaultValue$1<TDefault>, null | undefined>;
interface NullishSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends Default$1<TWrapped, null | undefined>> extends BaseSchema$1<InferInput$1<TWrapped> | null | undefined, InferNullishOutput$1<TWrapped, TDefault>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "nullish";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof nullish$1;
	/**
	 * The expected property.
	 */
	readonly expects: `(${TWrapped["expects"]} | null | undefined)`;
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function nullish$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): NullishSchema$1<TWrapped, undefined>;
declare function nullish$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends Default$1<TWrapped, null | undefined>>(wrapped: TWrapped, default_: TDefault): NullishSchema$1<TWrapped, TDefault>;
interface NullishSchemaAsync$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends DefaultAsync$1<TWrapped, null | undefined>> extends BaseSchemaAsync$1<InferInput$1<TWrapped> | null | undefined, InferNullishOutput$1<TWrapped, TDefault>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "nullish";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof nullish$1 | typeof nullishAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: `(${TWrapped["expects"]} | null | undefined)`;
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function nullishAsync$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): NullishSchemaAsync$1<TWrapped, undefined>;
declare function nullishAsync$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends DefaultAsync$1<TWrapped, null | undefined>>(wrapped: TWrapped, default_: TDefault): NullishSchemaAsync$1<TWrapped, TDefault>;
interface NumberIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "number";
	/**
	 * The expected property.
	 */
	readonly expected: "number";
}
interface NumberSchema$1<TMessage extends ErrorMessage$1<NumberIssue$1> | undefined> extends BaseSchema$1<number, number, NumberIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "number";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof number$1;
	/**
	 * The expected property.
	 */
	readonly expects: "number";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function number$1(): NumberSchema$1<undefined>;
declare function number$1<const TMessage extends ErrorMessage$1<NumberIssue$1> | undefined>(message: TMessage): NumberSchema$1<TMessage>;
interface ObjectIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "object";
	/**
	 * The expected property.
	 */
	readonly expected: "Object" | `"${string}"`;
}
interface ObjectSchema$1<TEntries extends ObjectEntries$1, TMessage extends ErrorMessage$1<ObjectIssue$1> | undefined> extends BaseSchema$1<InferObjectInput$1<TEntries>, InferObjectOutput$1<TEntries>, ObjectIssue$1 | InferObjectIssue$1<TEntries>> {
	/**
	 * The schema type.
	 */
	readonly type: "object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof object$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function object$1<const TEntries extends ObjectEntries$1>(entries: TEntries): ObjectSchema$1<TEntries, undefined>;
declare function object$1<const TEntries extends ObjectEntries$1, const TMessage extends ErrorMessage$1<ObjectIssue$1> | undefined>(entries: TEntries, message: TMessage): ObjectSchema$1<TEntries, TMessage>;
interface ObjectSchemaAsync$1<TEntries extends ObjectEntriesAsync$1, TMessage extends ErrorMessage$1<ObjectIssue$1> | undefined> extends BaseSchemaAsync$1<InferObjectInput$1<TEntries>, InferObjectOutput$1<TEntries>, ObjectIssue$1 | InferObjectIssue$1<TEntries>> {
	/**
	 * The schema type.
	 */
	readonly type: "object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof object$1 | typeof objectAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function objectAsync$1<const TEntries extends ObjectEntriesAsync$1>(entries: TEntries): ObjectSchemaAsync$1<TEntries, undefined>;
declare function objectAsync$1<const TEntries extends ObjectEntriesAsync$1, const TMessage extends ErrorMessage$1<ObjectIssue$1> | undefined>(entries: TEntries, message: TMessage): ObjectSchemaAsync$1<TEntries, TMessage>;
interface ObjectWithRestIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "object_with_rest";
	/**
	 * The expected property.
	 */
	readonly expected: "Object" | `"${string}"`;
}
interface ObjectWithRestSchema$1<TEntries extends ObjectEntries$1, TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<ObjectWithRestIssue$1> | undefined> extends BaseSchema$1<InferObjectInput$1<TEntries> & {
	[key: string]: InferInput$1<TRest>;
}, InferObjectOutput$1<TEntries> & {
	[key: string]: InferOutput$1<TRest>;
}, ObjectWithRestIssue$1 | InferObjectIssue$1<TEntries> | InferIssue$1<TRest>> {
	/**
	 * The schema type.
	 */
	readonly type: "object_with_rest";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof objectWithRest$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The rest schema.
	 */
	readonly rest: TRest;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function objectWithRest$1<const TEntries extends ObjectEntries$1, const TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(entries: TEntries, rest: TRest): ObjectWithRestSchema$1<TEntries, TRest, undefined>;
declare function objectWithRest$1<const TEntries extends ObjectEntries$1, const TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<ObjectWithRestIssue$1> | undefined>(entries: TEntries, rest: TRest, message: TMessage): ObjectWithRestSchema$1<TEntries, TRest, TMessage>;
interface ObjectWithRestSchemaAsync$1<TEntries extends ObjectEntriesAsync$1, TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<ObjectWithRestIssue$1> | undefined> extends BaseSchemaAsync$1<InferObjectInput$1<TEntries> & {
	[key: string]: InferInput$1<TRest>;
}, InferObjectOutput$1<TEntries> & {
	[key: string]: InferOutput$1<TRest>;
}, ObjectWithRestIssue$1 | InferObjectIssue$1<TEntries> | InferIssue$1<TRest>> {
	/**
	 * The schema type.
	 */
	readonly type: "object_with_rest";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof objectWithRest$1 | typeof objectWithRestAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The rest schema.
	 */
	readonly rest: TRest;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function objectWithRestAsync$1<const TEntries extends ObjectEntriesAsync$1, const TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>>(entries: TEntries, rest: TRest): ObjectWithRestSchemaAsync$1<TEntries, TRest, undefined>;
declare function objectWithRestAsync$1<const TEntries extends ObjectEntriesAsync$1, const TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<ObjectWithRestIssue$1> | undefined>(entries: TEntries, rest: TRest, message: TMessage): ObjectWithRestSchemaAsync$1<TEntries, TRest, TMessage>;
type InferOptionalOutput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends DefaultAsync$1<TWrapped, undefined>> = undefined extends TDefault ? InferOutput$1<TWrapped> | undefined : InferOutput$1<TWrapped> | Extract<DefaultValue$1<TDefault>, undefined>;
interface OptionalSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends Default$1<TWrapped, undefined>> extends BaseSchema$1<InferInput$1<TWrapped> | undefined, InferOptionalOutput$1<TWrapped, TDefault>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "optional";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof optional$1;
	/**
	 * The expected property.
	 */
	readonly expects: `(${TWrapped["expects"]} | undefined)`;
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function optional$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): OptionalSchema$1<TWrapped, undefined>;
declare function optional$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends Default$1<TWrapped, undefined>>(wrapped: TWrapped, default_: TDefault): OptionalSchema$1<TWrapped, TDefault>;
interface OptionalSchemaAsync$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends DefaultAsync$1<TWrapped, undefined>> extends BaseSchemaAsync$1<InferInput$1<TWrapped> | undefined, InferOptionalOutput$1<TWrapped, TDefault>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "optional";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof optional$1 | typeof optionalAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: `(${TWrapped["expects"]} | undefined)`;
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function optionalAsync$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): OptionalSchemaAsync$1<TWrapped, undefined>;
declare function optionalAsync$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends DefaultAsync$1<TWrapped, undefined>>(wrapped: TWrapped, default_: TDefault): OptionalSchemaAsync$1<TWrapped, TDefault>;
type PicklistOptions$1 = MaybeReadonly$1<(string | number | bigint)[]>;
interface PicklistIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "picklist";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}
interface PicklistSchema$1<TOptions extends PicklistOptions$1, TMessage extends ErrorMessage$1<PicklistIssue$1> | undefined> extends BaseSchema$1<TOptions[number], TOptions[number], PicklistIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "picklist";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof picklist$1;
	/**
	 * The picklist options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function picklist$1<const TOptions extends PicklistOptions$1>(options: TOptions): PicklistSchema$1<TOptions, undefined>;
declare function picklist$1<const TOptions extends PicklistOptions$1, const TMessage extends ErrorMessage$1<PicklistIssue$1> | undefined>(options: TOptions, message: TMessage): PicklistSchema$1<TOptions, TMessage>;
interface RecordIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "record";
	/**
	 * The expected property.
	 */
	readonly expected: "Object";
}
type IsLiteral$1<TKey extends string | number | symbol> = string extends TKey ? false : number extends TKey ? false : symbol extends TKey ? false : TKey extends Brand$1<string | number | symbol> ? false : true;
type OptionalKeys$1<TObject extends Record<string | number | symbol, unknown>> = {
	[TKey in keyof TObject]: IsLiteral$1<TKey> extends true ? TKey : never;
}[keyof TObject];
type WithQuestionMarks$1<TObject extends Record<string | number | symbol, unknown>> = MarkOptional$1<TObject, OptionalKeys$1<TObject>>;
type WithReadonly$1<TValue extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TObject extends WithQuestionMarks$1<Record<string | number | symbol, unknown>>> = TValue extends SchemaWithPipe$1<infer TPipe> | SchemaWithPipeAsync$1<infer TPipe> ? ReadonlyAction$1<any> extends TPipe[number] ? Readonly<TObject> : TObject : TObject;
type InferRecordInput$1<TKey extends BaseSchema$1<string, string | number | symbol, BaseIssue$1<unknown>> | BaseSchemaAsync$1<string, string | number | symbol, BaseIssue$1<unknown>>, TValue extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = Prettify$1<WithQuestionMarks$1<Record<InferInput$1<TKey>, InferInput$1<TValue>>>>;
type InferRecordOutput$1<TKey extends BaseSchema$1<string, string | number | symbol, BaseIssue$1<unknown>> | BaseSchemaAsync$1<string, string | number | symbol, BaseIssue$1<unknown>>, TValue extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>> = Prettify$1<WithReadonly$1<TValue, WithQuestionMarks$1<Record<InferOutput$1<TKey>, InferOutput$1<TValue>>>>>;
interface RecordSchema$1<TKey extends BaseSchema$1<string, string | number | symbol, BaseIssue$1<unknown>>, TValue extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<RecordIssue$1> | undefined> extends BaseSchema$1<InferRecordInput$1<TKey, TValue>, InferRecordOutput$1<TKey, TValue>, RecordIssue$1 | InferIssue$1<TKey> | InferIssue$1<TValue>> {
	/**
	 * The schema type.
	 */
	readonly type: "record";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof record$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The record key schema.
	 */
	readonly key: TKey;
	/**
	 * The record value schema.
	 */
	readonly value: TValue;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function record$1<const TKey extends BaseSchema$1<string, string | number | symbol, BaseIssue$1<unknown>>, const TValue extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(key: TKey, value: TValue): RecordSchema$1<TKey, TValue, undefined>;
declare function record$1<const TKey extends BaseSchema$1<string, string | number | symbol, BaseIssue$1<unknown>>, const TValue extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<RecordIssue$1> | undefined>(key: TKey, value: TValue, message: TMessage): RecordSchema$1<TKey, TValue, TMessage>;
interface StrictObjectIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "strict_object";
	/**
	 * The expected property.
	 */
	readonly expected: "Object" | `"${string}"` | "never";
}
interface StrictObjectSchema$1<TEntries extends ObjectEntries$1, TMessage extends ErrorMessage$1<StrictObjectIssue$1> | undefined> extends BaseSchema$1<InferObjectInput$1<TEntries>, InferObjectOutput$1<TEntries>, StrictObjectIssue$1 | InferObjectIssue$1<TEntries>> {
	/**
	 * The schema type.
	 */
	readonly type: "strict_object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof strictObject$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function strictObject$1<const TEntries extends ObjectEntries$1>(entries: TEntries): StrictObjectSchema$1<TEntries, undefined>;
declare function strictObject$1<const TEntries extends ObjectEntries$1, const TMessage extends ErrorMessage$1<StrictObjectIssue$1> | undefined>(entries: TEntries, message: TMessage): StrictObjectSchema$1<TEntries, TMessage>;
interface StrictObjectSchemaAsync$1<TEntries extends ObjectEntriesAsync$1, TMessage extends ErrorMessage$1<StrictObjectIssue$1> | undefined> extends BaseSchemaAsync$1<InferObjectInput$1<TEntries>, InferObjectOutput$1<TEntries>, StrictObjectIssue$1 | InferObjectIssue$1<TEntries>> {
	/**
	 * The schema type.
	 */
	readonly type: "strict_object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof strictObject$1 | typeof strictObjectAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function strictObjectAsync$1<const TEntries extends ObjectEntriesAsync$1>(entries: TEntries): StrictObjectSchemaAsync$1<TEntries, undefined>;
declare function strictObjectAsync$1<const TEntries extends ObjectEntriesAsync$1, const TMessage extends ErrorMessage$1<StrictObjectIssue$1> | undefined>(entries: TEntries, message: TMessage): StrictObjectSchemaAsync$1<TEntries, TMessage>;
interface StrictTupleIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "strict_tuple";
	/**
	 * The expected property.
	 */
	readonly expected: "Array" | "never";
}
interface StrictTupleSchema$1<TItems extends TupleItems$1, TMessage extends ErrorMessage$1<StrictTupleIssue$1> | undefined> extends BaseSchema$1<InferTupleInput$1<TItems>, InferTupleOutput$1<TItems>, StrictTupleIssue$1 | InferTupleIssue$1<TItems>> {
	/**
	 * The schema type.
	 */
	readonly type: "strict_tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof strictTuple$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The items schema.
	 */
	readonly items: TItems;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function strictTuple$1<const TItems extends TupleItems$1>(items: TItems): StrictTupleSchema$1<TItems, undefined>;
declare function strictTuple$1<const TItems extends TupleItems$1, const TMessage extends ErrorMessage$1<StrictTupleIssue$1> | undefined>(items: TItems, message: TMessage): StrictTupleSchema$1<TItems, TMessage>;
interface StringIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "string";
	/**
	 * The expected property.
	 */
	readonly expected: "string";
}
interface StringSchema$1<TMessage extends ErrorMessage$1<StringIssue$1> | undefined> extends BaseSchema$1<string, string, StringIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "string";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof string$1;
	/**
	 * The expected property.
	 */
	readonly expects: "string";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function string$1(): StringSchema$1<undefined>;
declare function string$1<const TMessage extends ErrorMessage$1<StringIssue$1> | undefined>(message: TMessage): StringSchema$1<TMessage>;
interface TupleIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "tuple";
	/**
	 * The expected property.
	 */
	readonly expected: "Array";
}
interface TupleSchema$1<TItems extends TupleItems$1, TMessage extends ErrorMessage$1<TupleIssue$1> | undefined> extends BaseSchema$1<InferTupleInput$1<TItems>, InferTupleOutput$1<TItems>, TupleIssue$1 | InferTupleIssue$1<TItems>> {
	/**
	 * The schema type.
	 */
	readonly type: "tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof tuple$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The items schema.
	 */
	readonly items: TItems;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function tuple$1<const TItems extends TupleItems$1>(items: TItems): TupleSchema$1<TItems, undefined>;
declare function tuple$1<const TItems extends TupleItems$1, const TMessage extends ErrorMessage$1<TupleIssue$1> | undefined>(items: TItems, message: TMessage): TupleSchema$1<TItems, TMessage>;
interface TupleWithRestIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "tuple_with_rest";
	/**
	 * The expected property.
	 */
	readonly expected: "Array";
}
interface TupleWithRestSchema$1<TItems extends TupleItems$1, TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TMessage extends ErrorMessage$1<TupleWithRestIssue$1> | undefined> extends BaseSchema$1<[
	...InferTupleInput$1<TItems>,
	...InferInput$1<TRest>[]
], [
	...InferTupleOutput$1<TItems>,
	...InferOutput$1<TRest>[]
], TupleWithRestIssue$1 | InferTupleIssue$1<TItems> | InferIssue$1<TRest>> {
	/**
	 * The schema type.
	 */
	readonly type: "tuple_with_rest";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof tupleWithRest$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The items schema.
	 */
	readonly items: TItems;
	/**
	 * The rest schema.
	 */
	readonly rest: TRest;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function tupleWithRest$1<const TItems extends TupleItems$1, const TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(items: TItems, rest: TRest): TupleWithRestSchema$1<TItems, TRest, undefined>;
declare function tupleWithRest$1<const TItems extends TupleItems$1, const TRest extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TMessage extends ErrorMessage$1<TupleWithRestIssue$1> | undefined>(items: TItems, rest: TRest, message: TMessage): TupleWithRestSchema$1<TItems, TRest, TMessage>;
interface UndefinedIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "undefined";
	/**
	 * The expected property.
	 */
	readonly expected: "undefined";
}
interface UndefinedSchema$1<TMessage extends ErrorMessage$1<UndefinedIssue$1> | undefined> extends BaseSchema$1<undefined, undefined, UndefinedIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "undefined";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof undefined_$1;
	/**
	 * The expected property.
	 */
	readonly expects: "undefined";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function undefined_$1(): UndefinedSchema$1<undefined>;
declare function undefined_$1<const TMessage extends ErrorMessage$1<UndefinedIssue$1> | undefined>(message: TMessage): UndefinedSchema$1<TMessage>;
type InferUndefinedableOutput$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends DefaultAsync$1<TWrapped, undefined>> = undefined extends TDefault ? InferOutput$1<TWrapped> | undefined : InferOutput$1<TWrapped> | Extract<DefaultValue$1<TDefault>, undefined>;
interface UndefinedableSchema$1<TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, TDefault extends Default$1<TWrapped, undefined>> extends BaseSchema$1<InferInput$1<TWrapped> | undefined, InferUndefinedableOutput$1<TWrapped, TDefault>, InferIssue$1<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "undefinedable";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof undefinedable$1;
	/**
	 * The expected property.
	 */
	readonly expects: `(${TWrapped["expects"]} | undefined)`;
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}
declare function undefinedable$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>>(wrapped: TWrapped): UndefinedableSchema$1<TWrapped, undefined>;
declare function undefinedable$1<const TWrapped extends BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, const TDefault extends Default$1<TWrapped, undefined>>(wrapped: TWrapped, default_: TDefault): UndefinedableSchema$1<TWrapped, TDefault>;
interface UnknownSchema$1 extends BaseSchema$1<unknown, unknown, never> {
	/**
	 * The schema type.
	 */
	readonly type: "unknown";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof unknown$1;
	/**
	 * The expected property.
	 */
	readonly expects: "unknown";
}
declare function unknown$1(): UnknownSchema$1;
interface VariantSchema$1<TKey extends string, TOptions extends VariantOptions$1<TKey>, TMessage extends ErrorMessage$1<VariantIssue$1> | undefined> extends BaseSchema$1<InferInput$1<TOptions[number]>, InferOutput$1<TOptions[number]>, VariantIssue$1 | InferVariantIssue$1<TOptions>> {
	/**
	 * The schema type.
	 */
	readonly type: "variant";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof variant$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The discriminator key.
	 */
	readonly key: TKey;
	/**
	 * The variant options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function variant$1<const TKey extends string, const TOptions extends VariantOptions$1<TKey>>(key: TKey, options: TOptions): VariantSchema$1<TKey, TOptions, undefined>;
declare function variant$1<const TKey extends string, const TOptions extends VariantOptions$1<TKey>, const TMessage extends ErrorMessage$1<VariantIssue$1> | undefined>(key: TKey, options: TOptions, message: TMessage): VariantSchema$1<TKey, TOptions, TMessage>;
interface VariantSchemaAsync$1<TKey extends string, TOptions extends VariantOptionsAsync$1<TKey>, TMessage extends ErrorMessage$1<VariantIssue$1> | undefined> extends BaseSchemaAsync$1<InferInput$1<TOptions[number]>, InferOutput$1<TOptions[number]>, VariantIssue$1 | InferVariantIssue$1<TOptions>> {
	/**
	 * The schema type.
	 */
	readonly type: "variant";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof variant$1 | typeof variantAsync$1;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The discriminator key.
	 */
	readonly key: TKey;
	/**
	 * The variant options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function variantAsync$1<const TKey extends string, const TOptions extends VariantOptionsAsync$1<TKey>>(key: TKey, options: TOptions): VariantSchemaAsync$1<TKey, TOptions, undefined>;
declare function variantAsync$1<const TKey extends string, const TOptions extends VariantOptionsAsync$1<TKey>, const TMessage extends ErrorMessage$1<VariantIssue$1> | undefined>(key: TKey, options: TOptions, message: TMessage): VariantSchemaAsync$1<TKey, TOptions, TMessage>;
interface VariantIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "variant";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}
interface VariantOptionSchema$1<TKey extends string> extends BaseSchema$1<unknown, unknown, VariantIssue$1 | BaseIssue$1<unknown>> {
	readonly type: "variant";
	readonly reference: typeof variant$1;
	readonly key: string;
	readonly options: VariantOptions$1<TKey>;
	readonly message: ErrorMessage$1<VariantIssue$1> | undefined;
}
interface VariantOptionSchemaAsync$1<TKey extends string> extends BaseSchemaAsync$1<unknown, unknown, VariantIssue$1 | BaseIssue$1<unknown>> {
	readonly type: "variant";
	readonly reference: typeof variant$1 | typeof variantAsync$1;
	readonly key: string;
	readonly options: VariantOptionsAsync$1<TKey>;
	readonly message: ErrorMessage$1<VariantIssue$1> | undefined;
}
type VariantObjectEntries$1<TKey extends string> = Record<TKey, BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | OptionalEntrySchema$1> & ObjectEntries$1;
type VariantObjectEntriesAsync$1<TKey extends string> = Record<TKey, BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>> | OptionalEntrySchema$1 | OptionalEntrySchemaAsync$1> & ObjectEntriesAsync$1;
type VariantOption$1<TKey extends string> = LooseObjectSchema$1<VariantObjectEntries$1<TKey>, ErrorMessage$1<LooseObjectIssue$1> | undefined> | ObjectSchema$1<VariantObjectEntries$1<TKey>, ErrorMessage$1<ObjectIssue$1> | undefined> | ObjectWithRestSchema$1<VariantObjectEntries$1<TKey>, BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>>, ErrorMessage$1<ObjectWithRestIssue$1> | undefined> | StrictObjectSchema$1<VariantObjectEntries$1<TKey>, ErrorMessage$1<StrictObjectIssue$1> | undefined> | VariantOptionSchema$1<TKey>;
type VariantOptionAsync$1<TKey extends string> = LooseObjectSchemaAsync$1<VariantObjectEntriesAsync$1<TKey>, ErrorMessage$1<LooseObjectIssue$1> | undefined> | ObjectSchemaAsync$1<VariantObjectEntriesAsync$1<TKey>, ErrorMessage$1<ObjectIssue$1> | undefined> | ObjectWithRestSchemaAsync$1<VariantObjectEntriesAsync$1<TKey>, BaseSchema$1<unknown, unknown, BaseIssue$1<unknown>> | BaseSchemaAsync$1<unknown, unknown, BaseIssue$1<unknown>>, ErrorMessage$1<ObjectWithRestIssue$1> | undefined> | StrictObjectSchemaAsync$1<VariantObjectEntriesAsync$1<TKey>, ErrorMessage$1<StrictObjectIssue$1> | undefined> | VariantOptionSchemaAsync$1<TKey>;
type VariantOptions$1<TKey extends string> = MaybeReadonly$1<VariantOption$1<TKey>[]>;
type VariantOptionsAsync$1<TKey extends string> = MaybeReadonly$1<(VariantOption$1<TKey> | VariantOptionAsync$1<TKey>)[]>;
type InferVariantIssue$1<TOptions extends VariantOptions$1<string> | VariantOptionsAsync$1<string>> = Exclude<InferIssue$1<TOptions[number]>, {
	type: "loose_object" | "object" | "object_with_rest";
}>;
interface VoidIssue$1 extends BaseIssue$1<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "void";
	/**
	 * The expected property.
	 */
	readonly expected: "void";
}
interface VoidSchema$1<TMessage extends ErrorMessage$1<VoidIssue$1> | undefined> extends BaseSchema$1<void, void, VoidIssue$1> {
	/**
	 * The schema type.
	 */
	readonly type: "void";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof void_$1;
	/**
	 * The expected property.
	 */
	readonly expects: "void";
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}
declare function void_$1(): VoidSchema$1<undefined>;
declare function void_$1<const TMessage extends ErrorMessage$1<VoidIssue$1> | undefined>(message: TMessage): VoidSchema$1<TMessage>;
declare const BrandSymbol$1: unique symbol;
type BrandName$1 = string | number | symbol;
interface Brand$1<TName extends BrandName$1> {
	[BrandSymbol$1]: {
		[TValue in TName]: TValue;
	};
}
interface DescriptionAction$1<TInput, TDescription extends string> extends BaseMetadata$1<TInput> {
	/**
	 * The action type.
	 */
	readonly type: "description";
	/**
	 * The action reference.
	 */
	readonly reference: typeof description$1;
	/**
	 * The description text.
	 */
	readonly description: TDescription;
}
declare function description$1<TInput, TDescription extends string>(description_: TDescription): DescriptionAction$1<TInput, TDescription>;
interface MetadataAction$1$1<TInput, TMetadata extends Record<string, unknown>> extends BaseMetadata$1<TInput> {
	/**
	 * The action type.
	 */
	readonly type: "metadata";
	/**
	 * The action reference.
	 */
	readonly reference: typeof metadata$1;
	/**
	 * The metadata object.
	 */
	readonly metadata: TMetadata;
}
declare function metadata$1<TInput, const TMetadata extends Record<string, unknown>>(metadata_: TMetadata): MetadataAction$1$1<TInput, TMetadata>;
type ReadonlyOutput$1<TInput> = TInput extends Map<infer TKey, infer TValue> ? ReadonlyMap<TKey, TValue> : TInput extends Set<infer TValue> ? ReadonlySet<TValue> : Readonly<TInput>;
interface ReadonlyAction$1<TInput> extends BaseTransformation$1<TInput, ReadonlyOutput$1<TInput>, never> {
	/**
	 * The action type.
	 */
	readonly type: "readonly";
	/**
	 * The action reference.
	 */
	readonly reference: typeof readonly$1;
}
declare function readonly$1<TInput>(): ReadonlyAction$1<TInput>;
export type DisabledValueStrategy = "reserve" | "delete";
export interface FieldTransformerConfig {
	toView?: (value: any, control: AbstractControl) => any;
	toModel?: (value: any, control: AbstractControl) => any;
}
export type LogicType = "and" | "or";
export type ArrayDeletionMode = "shrink" | "mark";
export interface FieldFormConfig<T = any> {
	disabled?: boolean;
	/** 删除时value应该如何处理 */
	disabledValue?: DisabledValueStrategy;
	transformer?: FieldTransformerConfig;
	pipe?: {
		toModel?: UnaryFunction<Observable<any>, Observable<T>>;
	};
	defaultValue?: any;
	validators?: ValidatorFn[];
	asyncValidators?: AsyncValidatorFn[];
	updateOn?: FormHooks;
	/** auto */
	required?: boolean;
	undefinedable?: boolean;
	nullable?: boolean;
	/** array/group/logic group */
	emptyValue?: any;
	/** array  */
	deletionMode?: ArrayDeletionMode;
	/** group/array */
	groupMode?: "loose" | "default" | "strict" | "reset";
	groupKeySchema?: BaseSchema<any, any, any>;
	groupValueSchema?: BaseSchema<any, any, any>;
	/** logic group */
	/** or在更新值时,会自动切换到第一个匹配的 */
	disableOrUpdateActivate?: boolean;
}
export type FieldFormConfig$ = WritableSignal<FieldFormConfig>;
export type FieldGroupConfig$ = WritableSignal<Omit<FieldFormConfig, "defaultValue">>;
export type FieldArrayConfig$ = WritableSignal<Omit<FieldFormConfig, "defaultValue">>;
export type FieldLogicGroupConfig$ = WritableSignal<Omit<FieldFormConfig, "defaultValue">>;
export declare const enum UpdateType {
	init = 0,
	update = 1,
	reset = 2
}
export declare const enum ValueType {
	/** 全部有效 */
	valid = 0,
	/** 部分有效 */
	partialValid = 1,
	/** 也返回带禁用的有效 */
	allPartialValid = 2
}
declare const ValidatorPending: unique symbol;
export type ValidationErrorsLegacy = {
	[key: string]: any;
};
export type ValidationValibotError2 = {
	kind: "valibot";
	metadata: [
		V.BaseIssue<unknown>,
		...V.BaseIssue<unknown>[]
	];
};
export type ValidationErrorError2 = {
	kind: "error";
	metadata: Error;
};
export type ValidationDescendantError2 = {
	kind: "descendant";
	key: string | number;
	field: AbstractControl;
	metadata: ValidationCommonError2[];
};
export type ValidationCommonError2 = {
	kind: string;
	metadata?: any;
	message?: string;
};
export type ValidationErrors2 = ValidationValibotError2 | ValidationErrorError2 | ValidationDescendantError2 | ValidationCommonError2;
export interface ValidatorFn {
	(control: AbstractControl): ValidationErrorsLegacy | ValidationErrors2[] | undefined;
}
export interface AsyncValidatorFn {
	(control: AbstractControl): Promise<ValidationErrorsLegacy | ValidationErrors2[] | undefined> | Observable<ValidationErrorsLegacy | ValidationErrors2[] | undefined> | Signal<ValidationErrorsLegacy | ValidationErrors2[] | undefined>;
}
declare const VALID = "VALID";
declare const INVALID = "INVALID";
declare const PENDING = "PENDING";
export type VALID_STATUS = typeof VALID | typeof INVALID | typeof PENDING;
export type FormHooks = "change" | "blur" | "submit";
export type AbstractControlParams = ConstructorParameters<typeof AbstractControl<any>>;
declare const InitPendingValue: {
	touched: boolean;
	change: boolean;
	value: undefined;
};
declare enum ValueEvent {
	view = "view",
	model = "model"
}
declare abstract class AbstractControl<TValue = any> {
	#private;
	protected skipValuePath?: boolean;
	pendingStatus: _angular_core.WritableSignal<{
		touched: boolean;
		change: boolean;
		value: undefined;
	}>;
	protected readonly emptyValue$$: Signal<any>;
	shouldEmitValue$$: Signal<boolean>;
	/** 父级取值时,当前子级是否包含在内 */
	shouldInclude$$: Signal<boolean>;
	readonly injector: Injector;
	originValue$$: Signal<TValue | undefined>;
	/** model的value */
	value$$: Signal<TValue>;
	abstract get valueEvent$$(): Observable<ValueEvent>;
	/** 通用的子级,用于查询之类 */
	children$$?: Signal<{
		[s: string]: AbstractControl;
	} | ArrayLike<AbstractControl>>;
	/** disabled */
	readonly selfDisabled$$: Signal<boolean>;
	/** `self` || `parent` */
	readonly disabled$$: Signal<boolean>;
	readonly enabled$$: Signal<boolean>;
	get disabled(): boolean;
	get enabled(): boolean;
	enable(): void;
	disable(): void;
	/** touched */
	readonly selfTouched$: _angular_core.WritableSignal<boolean>;
	readonly touched$$: Signal<boolean>;
	get touched(): boolean;
	get untouched(): boolean;
	/** dirty */
	private readonly selfDirty$;
	readonly dirty$$: Signal<boolean>;
	get dirty(): boolean;
	get pristine(): boolean;
	isOptionalEmpty: Signal<boolean>;
	protected resetIndex$: _angular_core.WritableSignal<number>;
	syncError$: _angular_core.WritableSignal<ValidationErrors2[] | undefined>;
	asyncErrorRes$$: Signal<Signal<typeof ValidatorPending | (ValidationValibotError2 | ValidationErrorError2 | ValidationDescendantError2 | ValidationCommonError2)[] | undefined> | undefined>;
	asyncError$$: Signal<"PENDING" | (ValidationValibotError2 | ValidationErrorError2 | ValidationDescendantError2 | ValidationCommonError2)[] | undefined>;
	rawError$$: Signal<"PENDING" | ValidationErrors2[] | undefined>;
	valueNoError$$: Signal<boolean>;
	get errors(): ValidationErrors2[] | undefined;
	/** parent */
	private _parent?;
	get parent(): AbstractControl | undefined;
	get valuePath(): (string | number)[];
	get fieldPath(): (string | number)[];
	get value(): TValue;
	required$$: Signal<boolean | undefined>;
	readonly schemaParser: V.SafeParser<SchemaOrPipe, undefined>;
	context: any;
	constructor(rawSchema: SchemaOrPipe, injector: Injector);
	protected schemaCheck2$$(value: any): V.SafeParseResult<SchemaOrPipe>;
	setParent(parent: AbstractControl | undefined): void;
	get valid(): boolean;
	get invalid(): boolean;
	get pending(): boolean;
	updateOn$$: Signal<FormHooks>;
	markAsTouched(): void;
	markAllAsDirty(): void;
	markAllAsPristine(): void;
	markAllAsTouched(): void;
	markAllAsUntouched(): void;
	markAsUntouched(): void;
	markAsDirty(): void;
	markAsPristine(): void;
	reset(_value?: any): void;
	getRawValue(_mode?: ValueType): any;
	get<P extends string | (string | number)[]>(path: P): AbstractControl | null;
	get root(): AbstractControl;
	updateValue(_value: any): void;
	config$: FieldFormConfig$;
	protected getInitValue(value: any): any;
	protected transformToModel(value: any, control: AbstractControl<any>): any;
	find(_name: string | number): AbstractControl | null;
	setControl(_name: string | number, _control: AbstractControl): void;
	activatedChildren(): Iterable<[
		string | number,
		AbstractControl
	]>;
	/** 校验和获得值用 */
	private reduceChildren;
	get valueChanges(): Observable<any>;
	status$$: Signal<VALID_STATUS>;
	get statusChanges(): Observable<VALID_STATUS>;
	/** 仅触发 updateOn: submit 时使用 */
	emitSubmit(): void;
	protected isUnChanged(): boolean;
}
declare class FieldGroupbase<TValue = any> extends AbstractControl<TValue> {
	resetValue$: _angular_core.WritableSignal<any>;
	get valueEvent$$(): Observable<ValueEvent>;
	updateValue(value: any): void;
	protected inited: boolean;
	reset(value?: any): void;
	emitSubmit(): void;
}
declare class FieldGroup<TValue = any, TControl extends {
	[K in keyof TControl]: AbstractControl<any>;
} = any> extends FieldGroupbase<TValue> {
	#private;
	originValue$$: _angular_core.Signal<any>;
	fixedControls$: _angular_core.WritableSignal<Record<string, AbstractControl<any>>>;
	resetControls$: _angular_core.WritableSignal<Record<string, AbstractControl<any>>>;
	get controls(): {
		[x: string]: AbstractControl<any>;
	};
	children$$: _angular_core.Signal<{
		[x: string]: AbstractControl<any>;
	}>;
	activatedChildren(): Generator<[
		string,
		AbstractControl<any>
	], void, unknown>;
	get valueEvent$$(): Observable<ValueEvent>;
	removeRestControl(key: string): void;
	setControl(key: string, control: AbstractControl): void;
	getValueByType(mode?: ValueType): any;
	getRawValue(mode?: ValueType): any;
	clear(): void;
	find(key: string): AbstractControl | null;
	getResetValue(inputValue: any): Record<string, any>;
}
declare class FieldControl<TValue = any> extends AbstractControl<TValue> {
	#private;
	/** 视图变化时model值不变也要更新view */
	private viewIndex$;
	valueEvent$$: Subject<ValueEvent>;
	/** model输入值 */
	modelValue$: WritableSignal<TValue | undefined>;
	private modelValueToViewValueOrigin$$;
	/** 传入到view中的值 */
	modelValueToViewValue$$: _angular_core.Signal<any>;
	/** modelValue + viewValue => modelValue */
	originValue$$: WritableSignal<any>;
	reset(formState?: TValue): void;
	/** view变更 */
	viewValueChange(value: TValue | undefined): void;
	updateValue(value: any, force?: boolean): void;
	emitSubmit(): void;
	updateInitValue(value: any): void;
}
declare class FieldArray<TValue = any, TControl extends AbstractControl<any> = any> extends FieldGroupbase<TValue> {
	#private;
	originValue$$: _angular_core.Signal<any>;
	children$$: _angular_core.Signal<AbstractControl<any>[]>;
	fixedControls$: _angular_core.WritableSignal<AbstractControl<any>[]>;
	resetControls$: _angular_core.WritableSignal<AbstractControl<any>[]>;
	get controls(): AbstractControl<any>[];
	activatedChildren(): Iterable<[
		string | number,
		AbstractControl
	]>;
	get valueEvent$$(): Observable<ValueEvent>;
	removeRestControl(key: number): void;
	setControl(key: number, control: TControl): void;
	get length(): number;
	getValueByType(mode?: ValueType): any;
	getRawValue(mode?: ValueType): any;
	clear(): void;
	find(key: number): AbstractControl;
	getResetValue(value?: any[]): any[];
}
declare class FieldLogicGroup<TValue = any> extends FieldArray<TValue> {
	#private;
	protected skipValuePath: boolean;
	activateIndex$: _angular_core.WritableSignal<number>;
	type: _angular_core.WritableSignal<LogicType>;
	/** 过滤激活控件 */
	filterActivateControl$: _angular_core.WritableSignal<((item: AbstractControl, index: number, list: AbstractControl[]) => boolean) | undefined>;
	originValue$$: _angular_core.Signal<any>;
	activatedChildren: _angular_core.Signal<[
		number,
		AbstractControl<any>
	][]>;
	get valueEvent$$(): Observable<ValueEvent>;
	getValueByType(mode: ValueType): any;
	reset(value?: any[]): void;
	getRawValue(mode?: ValueType): any;
	updateValue(value: any): void;
}
declare function isFieldGroup(input: any): input is FieldGroup;
declare function isFieldArray(input: any): input is FieldArray;
declare function isFieldControl(input: any): input is FieldControl;
declare function isFieldLogicGroup(input: any): input is FieldLogicGroup;
declare function arrayStartsWith(list: any[], parts: any[] | any): boolean;
export type UnWrapSignal<T> = T extends Signal<infer Value> ? Value : T;
export type SignalInputValue<T> = T | Signal<T> | WritableSignal<T> | undefined;
export type KeyPath = (string | number)[];
export type RawKeyPath = string | number;
export type SetOptional<OBJ, K extends keyof OBJ> = Omit<OBJ, K> & Partial<Pick<OBJ, K>>;
export type SetRequired<OBJ, K extends keyof OBJ> = Omit<OBJ, K> & Required<Pick<OBJ, K>>;
export type SetReadonly<OBJ, K extends keyof OBJ> = Omit<OBJ, K> & Readonly<Pick<OBJ, K>>;
export type ArraryIterable<T> = T[] | Iterable<T>;
export type QueryPath = string | number | KeyPath;
export type Wrapper$<T> = {
	[P in keyof T]: WritableSignal<T[P]>;
};
export type UnWrapper$<T> = {
	[P in keyof T]: UnWrapSignal<T[P]>;
};
export type Wrapper$$<T> = {
	[P in keyof T]: Signal<T[P]>;
};
export type SetWrapper$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> & Wrapper$<Pick<OBJ, K>>;
export type SetUnWrapper$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> & UnWrapper$<Pick<OBJ, K>>;
export type SetWrapper$$<OBJ, K extends keyof OBJ> = Omit<OBJ, K> & Wrapper$$<Pick<OBJ, K>>;
export type Writeable<T> = {
	-readonly [P in keyof T]: T[P];
};
declare function effectListen(listen: () => any, fn: () => void, options?: CreateEffectOptions): EffectRef;
/**
 * Options for `toObservable`.
 *
 * @publicApi 20.0
 */
export interface ToObservableOptions {
	/**
	 * The `Injector` to use when creating the underlying `effect` which watches the signal.
	 *
	 * If this isn't specified, the current [injection context](guide/di/dependency-injection-context)
	 * will be used.
	 */
	injector?: Injector;
}
declare function toObservable<T>(listen: Signal<any>, source: Signal<T>, options?: ToObservableOptions): Observable<T>;
declare const clone: <T>(input: T) => T;
declare function toArray(input: any): any[] | undefined;
declare class SortedArray<T> extends Array {
	#private;
	constructor(compareFn: (a: T, b: T) => number);
	push(...items: any[]): number;
}
export type LazyImport<T> = () => Promise<T>;
declare const markSymbol: unique symbol;
declare function lazyMark<T>(fn: LazyImport<T>): {
	[markSymbol]: LazyImport<T>;
};
export type LazyMarkType<T> = ReturnType<typeof lazyMark<T>>;
declare function isLazyMark(input: any): boolean;
declare function getLazyImport<T>(input: any): T | undefined;
export interface ControlValueAccessor {
	/**
	 * @description
	 * Writes a new value to the element.
	 *
	 * This method is called by the forms API to write to the view when programmatic
	 * changes from model to view are requested.
	 *
	 * @usageNotes
	 * ### Write a value to the element
	 *
	 * The following example writes a value to the native DOM element.
	 *
	 * ```ts
	 * writeValue(value: any): void {
	 *   this._renderer.setProperty(this._elementRef.nativeElement, 'value', value);
	 * }
	 * ```
	 *
	 * @param obj The new value for the element
	 */
	writeValue(obj: any): void;
	/**
	 * @description
	 * Registers a callback function that is called when the control's value
	 * changes in the UI.
	 *
	 * This method is called by the forms API on initialization to update the form
	 * model when values propagate from the view to the model.
	 *
	 * When implementing the `registerOnChange` method in your own value accessor,
	 * save the given function so your class calls it at the appropriate time.
	 *
	 * @usageNotes
	 * ### Store the change function
	 *
	 * The following example stores the provided function as an internal method.
	 *
	 * ```ts
	 * registerOnChange(fn: (_: any) => void): void {
	 *   this._onChange = fn;
	 * }
	 * ```
	 *
	 * When the value changes in the UI, call the registered
	 * function to allow the forms API to update itself:
	 *
	 * ```ts
	 * host: {
	 *    '(change)': '_onChange($event.target.value)'
	 * }
	 * ```
	 *
	 * @param fn The callback function to register
	 */
	registerOnChange(fn: any): void;
	/**
	 * @description
	 * Registers a callback function that is called by the forms API on initialization
	 * to update the form model on blur.
	 *
	 * When implementing `registerOnTouched` in your own value accessor, save the given
	 * function so your class calls it when the control should be considered
	 * blurred or "touched".
	 *
	 * @usageNotes
	 * ### Store the callback function
	 *
	 * The following example stores the provided function as an internal method.
	 *
	 * ```ts
	 * registerOnTouched(fn: any): void {
	 *   this._onTouched = fn;
	 * }
	 * ```
	 *
	 * On blur (or equivalent), your class should call the registered function to allow
	 * the forms API to update itself:
	 *
	 * ```ts
	 * host: {
	 *    '(blur)': '_onTouched()'
	 * }
	 * ```
	 *
	 * @param fn The callback function to register
	 */
	registerOnTouched(fn: any): void;
	/**
	 * @description
	 * Function that is called by the forms API when the control status changes to
	 * or from 'DISABLED'. Depending on the status, it enables or disables the
	 * appropriate DOM element.
	 *
	 * @usageNotes
	 * The following is an example of writing the disabled property to a native DOM element:
	 *
	 * ```ts
	 * setDisabledState(isDisabled: boolean): void {
	 *   this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
	 * }
	 * ```
	 *
	 * @param isDisabled The disabled status to set on the element
	 */
	setDisabledState?(isDisabled: boolean): void;
}
declare function createViewControlLink(fieldControl: () => FieldControl, cva: ControlValueAccessor, injector: Injector): (destroy?: boolean) => void;
declare function controlStatusList(fieldControl?: AbstractControl, skipDisabled?: boolean): string[];
declare function fieldControlStatusClass(fieldControl?: AbstractControl, skipDisabled?: boolean): string;
declare function initListen(input: any, control: AbstractControl, injector: Injector, fn: (input: any) => void): _angular_core.EffectRef;
export interface ErrorSummary {
	/** 方便判断是哪一个控件产生的异常 */
	debugPathList: string[];
	/** 可以用于直接get查询到当前配置 */
	queryPathList: (number | string)[];
	fieldList: AbstractControl[];
	item: Exclude<ValidationErrors2, ValidationDescendantError2>;
	valibotIssueSummary: string | undefined;
}
declare function errorSummary(control?: AbstractControl): ErrorSummary[];
declare const getDeepError: typeof errorSummary;
export type ObservableSignal<Input, Output> = WritableSignal<Input> & {
	input: Signal<Input>;
	output: Signal<Output>;
	loading: Signal<boolean>;
	input$$: Observable<Input>;
	subject: BehaviorSubject$1<Input>;
	output$$: Observable<Output>;
};
declare function observableSignal<Input, Output>(initialValue: Input, options?: CreateSignalOptions<Input> & {
	pipe?: OperatorFunction<Input, Output>;
	injector?: Injector;
	autoDestroy?: boolean;
}): ObservableSignal<Input, Output>;
export type AsyncObjectSignal<Input> = Signal<Input> & {
	connect: (key: string, value: Signal<any> | Promise<any> | Observable<any> | any) => void;
	disconnect: (key: string) => void;
	set(value: Input): void;
	update(updateFn: (value: Input) => Input): void;
	map(fn: (input: Input) => any): void;
};
declare function asyncObjectSignal<Input extends Record<string, any> | undefined>(initialValue: Input, options?: CreateSignalOptions<Input>): AsyncObjectSignal<Input>;
export type CombineSignal<Input> = Signal<Input[]> & {
	add: (item: Signal<Input>, index?: number) => void;
	remove: (item: Signal<Input>) => void;
	items: () => Signal<Input>[];
	clean: () => void;
	update: (fn: (list: Signal<Input>[]) => Signal<Input>[]) => void;
};
declare function combineSignal<Input>(initialValue?: Signal<Input>[], options?: CreateSignalOptions<Input[]>): CombineSignal<Input>;
export interface LayoutAction<TInput = unknown> extends BaseMetadata<TInput> {
	readonly type: "layout";
	readonly reference: typeof layout$1;
	readonly value: {
		keyPath?: KeyPath;
		priority?: number;
	};
}
declare function layout$1<TInput>(value: LayoutAction["value"]): LayoutAction<TInput>;
export type InjectorProvider = Provider | StaticProvider;
declare class CoreSchemaHandle<Self extends CoreSchemaHandle<any, any>, RESOLVED_FN extends () => any> extends BaseSchemaHandle<Self> {
	inputs: ViewInputs;
	models: ViewModels;
	outputs: ViewOutputs;
	attributes: ViewAttributes;
	events: ViewEvents;
	slots: ViewSlots;
	/** 创建组件时的额外配置,由各前端框架确定泛型 */
	createOptions?: any;
	wrappers: RawCoreWrapperConfig[];
	props: ViewProps;
	alias?: string;
	movePath?: KeyPath;
	renderConfig?: FieldRenderConfig;
	/** todo 非表单应该可选 */
	formConfig: FieldFormConfig;
	id?: string;
	isLogicAnd: boolean;
	isLogicOr: boolean;
	isArray: boolean;
	isTuple: boolean;
	nonFieldControl: boolean;
	hooks?: HookConfig<ReturnType<RESOLVED_FN>>;
	providers?: InjectorProvider[];
	checkSchema?: V.BaseSchema<unknown, unknown, V.BaseIssue<unknown>>;
	checkActions: (V.BaseValidation<any, any, any> | V.BaseTransformation<any, any, any>)[];
	lazySchema(schema: LazySchema$2): void;
	arraySchema(schema: ArraySchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ArrayIssue> | undefined>): void;
	defaultSchema(schema: DefaultSchema): void;
	tupleDefault(schema: TupleSchema$2): void;
	objectDefault(schema: ObjectSchema$2): void;
	recordSchema(key: V.BaseSchema<unknown, unknown, V.BaseIssue<unknown>>, value: V.BaseSchema<unknown, unknown, V.BaseIssue<unknown>>): void;
	restSchema(schema: V.BaseSchema<unknown, unknown, V.BaseIssue<unknown>>): void;
	enumSchema(schema: EnumSchema$2): void;
	updateProps(key: string, value: any): void;
	intersectBefore(schema: IntersectSchema$2): void;
	logicItemSchema(schema: V.BaseSchema<unknown, unknown, V.BaseIssue<unknown>>, index: number, type: "intersect" | "union"): void;
	unionBefore(schema: UnionSchema$2): void;
	beforeSchemaType(schema: Schema$1): void;
	voidSchema(schema: VoidSchema$2): void;
	metadataDefaulthandle(metadata: MetadataAction$1, environments: string[]): void;
	validation(item: V.BaseValidation<any, any, V.BaseIssue<unknown>>): void;
	transformation(item: V.BaseTransformation<any, any, V.BaseIssue<unknown>>): void;
	end(schema: SchemaOrPipe): void;
	coreSchema: V.BaseSchema<any, any, any>;
	defineSchema(schema: SchemaOrPipe): void;
}
export type AnyCoreSchemaHandle = CoreSchemaHandle<any, () => _PiResolvedCommonViewFieldConfig>;
declare const rawConfig$1: <TInput>(value: (field: AnyCoreSchemaHandle, context?: any) => void, workOn?: "afterSchemaType") => _piying_valibot_visit.RawConfigAction<"viewRawConfig", TInput, AnyCoreSchemaHandle>;
declare function setComponent$1<T, D>(type: D): D extends string ? DefineTypeAction<T> : RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle> & {
	__type: D;
};
declare function findComponent<T>(field: _PiResolvedCommonViewFieldConfig, type: any): any;
declare function mergeOutputFn(field: _PiResolvedCommonViewFieldConfig, outputs: ViewOutputs): void;
declare const mergeOutputs: <T>(outputs: Record<string, (...args: any[]) => void>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
declare const asyncMergeOutputs: <T>(outputs: Record<string, (field: _PiResolvedCommonViewFieldConfig) => (...args: any[]) => void>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
export type EventChangeFn = (fn: (input: {
	list: KeyPath | undefined;
	output: string;
}[]) => Observable<{
	field: _PiResolvedCommonViewFieldConfig;
	list: any[];
	listenFields: _PiResolvedCommonViewFieldConfig[];
}>) => void;
declare function outputChangeFn(rawField: AnyCoreSchemaHandle, fn: EventChangeFn): void;
declare function outputChange$1<T>(fn: EventChangeFn): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
declare function setAlias$1<Alias extends string, T = any>(alias: Alias): RawConfigAction<"viewRawConfig", T> & {
	readonly alias: Alias;
};
declare function renderConfig$1<T>(type: FieldRenderConfig): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
declare function formConfig$1<T>(config: FieldFormConfig<T>): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
export type Hooks = AnyCoreSchemaHandle["hooks"];
export type HooksConfig<T> = <B>(hooks: T) => RawConfigActionCommon<B>;
declare const setHooks: HooksConfig<Hooks>;
declare const patchHooks: HooksConfig<Hooks>;
export type HooksKey = keyof NonNullable<Hooks>;
export type MergeHooksConfig<T> = <B>(hooks: T, options?: {
	position: "top" | "bottom";
}) => RawConfigActionCommon<B>;
declare function mergeHooksFn<T extends AnyCoreSchemaHandle>(hooks: T["hooks"], options: {
	position: "top" | "bottom";
}, field: T): void;
declare const mergeHooks: MergeHooksConfig<Hooks>;
declare function removeHooks<T>(list: HooksKey[]): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
export interface ValueChangFnOptions {
	list?: (KeyPath | undefined)[];
	skipInitValue?: boolean;
}
export type ValueChangeFn = (fn: (input?: ValueChangFnOptions) => Observable<{
	field: _PiResolvedCommonViewFieldConfig;
	list: any[];
	listenFields: _PiResolvedCommonViewFieldConfig[];
}>, field: _PiResolvedCommonViewFieldConfig) => void;
declare function valueChangeFn(field: _PiResolvedCommonViewFieldConfig, input?: ValueChangFnOptions): Observable<{
	list: any[];
	field: _PiResolvedCommonViewFieldConfig;
	listenFields: _PiResolvedCommonViewFieldConfig[];
}>;
declare function valueChange$1<TInput>(listenFn: ValueChangeFn): _piying_valibot_visit.RawConfigAction<"viewRawConfig", TInput, PYVAC.AnyCoreSchemaHandle>;
export interface HideWhenOption<T extends _PiResolvedCommonViewFieldConfig = _PiResolvedCommonViewFieldConfig> {
	disabled?: boolean;
	listen: (fn: (input: ValueChangFnOptions) => Observable<{
		field: _PiResolvedCommonViewFieldConfig;
		list: any[];
		listenFields: _PiResolvedCommonViewFieldConfig[];
	}>, field: _PiResolvedCommonViewFieldConfig) => Observable<boolean>;
}
declare function hideWhen$1<TInput>(options: HideWhenOption): _piying_valibot_visit.RawConfigAction<"viewRawConfig", TInput, PYVAC.AnyCoreSchemaHandle>;
export interface DisableWhenOption<T extends _PiResolvedCommonViewFieldConfig = _PiResolvedCommonViewFieldConfig> {
	listen: (fn: (input: ValueChangFnOptions) => Observable<{
		field: _PiResolvedCommonViewFieldConfig;
		list: any[];
		listenFields: _PiResolvedCommonViewFieldConfig[];
	}>, field: _PiResolvedCommonViewFieldConfig) => Observable<boolean>;
}
declare function disableWhen$1<TInput>(options: DisableWhenOption): _piying_valibot_visit.RawConfigAction<"viewRawConfig", TInput, PYVAC.AnyCoreSchemaHandle>;
export interface NonFieldControlAction<TInput = unknown> extends BaseMetadata<TInput> {
	readonly type: "nonFieldControl";
	readonly reference: typeof nonFieldControl$1;
	readonly value: boolean;
}
declare function nonFieldControl$1<TInput>(value?: boolean): NonFieldControlAction<TInput>;
export type AsyncResult<T = any> = Promise<T> | Observable<T> | Signal<T> | (T & {});
export type AsyncProperty<T = any> = (field: _PiResolvedCommonViewFieldConfig) => AsyncResult<T>;
export type ChangeKey = "inputs" | "outputs" | "attributes" | "events" | "props" | "slots" | "models";
declare const CustomDataSymbol: unique symbol;
export type ConfigAction<T> = RawConfigAction<"viewRawConfig", T, any>;
export type WrapperChangeKey = Exclude<ChangeKey, "props">;
declare function removeWrappers<T>(removeList: string[] | ((list: Signal<CoreWrapperConfig>[]) => Signal<CoreWrapperConfig>[])): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
declare function patchAsyncWrapper<T>(type: any, actions?: ConfigAction<any>[], options?: {
	insertIndex?: number;
}): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
declare function changeAsyncWrapper<T>(indexFn: (list: Signal<CoreWrapperConfig>[]) => any, actions: ConfigAction<any>[]): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
declare const wrappers: {
	set: <T>(wrappers: (SetOptional<SetUnWrapper$<CoreWrapperConfig, WrapperChangeKey>, WrapperChangeKey> | string)[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
	patch: <T>(wrappers: (SetOptional<SetUnWrapper$<CoreWrapperConfig, WrapperChangeKey>, WrapperChangeKey> | string)[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, AnyCoreSchemaHandle>;
	patchAsync: typeof patchAsyncWrapper;
	remove: typeof removeWrappers;
	changeAsync: typeof changeAsyncWrapper;
};
export interface PiTypeConfig<TComponent = any, TActionList extends readonly BaseMetadata<any>[] = any[]> {
	type?: TComponent;
	actions?: TActionList;
}
export interface PiWrapperConfig<TWrapperComponent = any> {
	type: TWrapperComponent;
	actions?: RawConfigAction<"viewRawConfig", any, any>[];
}
export interface PiCommonConfig<TComponent = any, TWrapperComponent = any, Types extends Record<string, PiTypeConfig<TComponent>> = Record<string, PiTypeConfig<TComponent>>, Wrappers extends Record<string, PiWrapperConfig<TWrapperComponent>> = Record<string, PiWrapperConfig<TWrapperComponent>>> {
	types?: Types;
	wrappers?: Wrappers;
}
export type GetTypeConfig<Types extends Record<string, PiTypeConfig<any>>, Key extends string> = Key extends keyof Types ? Types[Key] : undefined;
export type GetWrapperConfig<Wrappers extends Record<string, PiWrapperConfig<any>>, Key extends string> = Key extends keyof Wrappers ? Wrappers[Key] : undefined;
declare const PI_VIEW_CONFIG_TOKEN: InjectionToken<PiCommonConfig<any, any, Record<string, PYVAC.PiTypeConfig<any, any[]>>, Record<string, PYVAC.PiWrapperConfig<any>>>>;
declare const PI_CONTEXT_TOKEN: InjectionToken<any>;
declare const PI_VIEW_FIELD_TOKEN: InjectionToken<Signal<_PiResolvedCommonViewFieldConfig>>;
export interface BuildRootInputItem<SchemaHandle extends CoreSchemaHandle<any, any>> {
	field: SchemaHandle;
	resolvedField$: WritableSignal<_PiResolvedCommonViewFieldConfig | undefined>;
}
export interface BuildRootItem {
	type: "root";
	field: {
		fieldGroup?: undefined;
		fullPath: [
		];
		injector: Injector;
		providers?: InjectorProvider[];
	};
	form?: undefined;
	resolvedField$: WritableSignal<_PiResolvedCommonViewFieldConfig | undefined>;
	append: (input: _PiResolvedCommonViewFieldConfig) => void;
}
export interface BuildGroupItem<SchemaHandle extends CoreSchemaHandle<any, any>> {
	type: "group";
	templateField?: SchemaHandle;
	fields: SchemaHandle[];
	form: FieldGroup;
	field: _PiResolvedCommonViewFieldConfig;
	append: (input: _PiResolvedCommonViewFieldConfig) => void;
	skipAppend?: boolean;
}
export interface BuildArrayItem<SchemaHandle extends CoreSchemaHandle<any, any>> {
	type: "array";
	templateField: SchemaHandle;
	fields: SchemaHandle[];
	form: FieldArray;
	field: _PiResolvedCommonViewFieldConfig;
	append: (input: _PiResolvedCommonViewFieldConfig) => void;
	skipAppend?: boolean;
}
export type AsyncCallback<R> = (field: _PiResolvedCommonViewFieldConfig) => Promise<R> | Observable<R> | Signal<R> | (R & {});
declare function topClass<T>(className: ClassValue, merge?: boolean): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
declare function patchAsyncClass<T>(fn: AsyncCallback<string>): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
declare function asyncTopClass<T>(classNameFn: AsyncCallback<ClassValue>): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
declare const classAction: {
	top: typeof topClass;
	bottom: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	component: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	asyncTop: typeof asyncTopClass;
	asyncBottom: typeof patchAsyncClass;
	asyncComponent: typeof patchAsyncClass;
};
declare function setProviders<T>(providers: InjectorProvider[]): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
declare function patchProviders<T>(providers: InjectorProvider[]): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
declare function changeProviders<T>(providersFn: (input: InjectorProvider[]) => InjectorProvider[]): _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
declare const actions$1: {
	class: {
		top: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		bottom: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		component: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		asyncTop: <T>(classNameFn: PYVAC.AsyncCallback<ClassValue>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		asyncBottom: <T>(fn: PYVAC.AsyncCallback<string>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		asyncComponent: <T>(fn: PYVAC.AsyncCallback<string>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	wrappers: {
		set: <T>(wrappers: (PYVAC.SetOptional<PYVAC.SetUnWrapper$<PYVAC.CoreWrapperConfig, "attributes" | "inputs" | "outputs" | "events" | "slots" | "models">, "attributes" | "inputs" | "outputs" | "events" | "slots" | "models"> | string)[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patch: <T>(wrappers: (PYVAC.SetOptional<PYVAC.SetUnWrapper$<PYVAC.CoreWrapperConfig, "attributes" | "inputs" | "outputs" | "events" | "slots" | "models">, "attributes" | "inputs" | "outputs" | "events" | "slots" | "models"> | string)[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(type: any, actions?: PYVAC.ConfigAction<any>[], options?: {
			insertIndex?: number;
		}) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(removeList: string[] | ((list: _angular_core.Signal<PYVAC.CoreWrapperConfig>[]) => _angular_core.Signal<PYVAC.CoreWrapperConfig>[])) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		changeAsync: <T>(indexFn: (list: _angular_core.Signal<PYVAC.CoreWrapperConfig>[]) => any, actions: PYVAC.ConfigAction<any>[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	hooks: {
		merge: PYVAC.MergeHooksConfig<PYVAC.HookConfig<PYVAC._PiResolvedCommonViewFieldConfig> | undefined>;
		remove: typeof removeHooks;
		set: PYVAC.HooksConfig<PYVAC.HookConfig<PYVAC._PiResolvedCommonViewFieldConfig> | undefined>;
		patch: PYVAC.HooksConfig<PYVAC.HookConfig<PYVAC._PiResolvedCommonViewFieldConfig> | undefined>;
	};
	providers: {
		set: typeof setProviders;
		patch: typeof patchProviders;
		change: typeof changeProviders;
	};
	inputs: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	models: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	outputs: {
		patch: <T>(value: Record<string, (...args: any[]) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, (...args: any[]) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, (field: PYVAC._PiResolvedCommonViewFieldConfig) => (...args: any[]) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		merge: <T>(outputs: Record<string, (...args: any[]) => void>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mergeAsync: <T>(outputs: Record<string, (field: PYVAC._PiResolvedCommonViewFieldConfig) => (...args: any[]) => void>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	attributes: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		top: {
			set: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
			patch: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		};
	};
	events: {
		patch: <T>(value: Record<string, (event: Event) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, (event: Event) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, (field: PYVAC._PiResolvedCommonViewFieldConfig) => (event: Event) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	slots: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	props: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	createOptions: {
		patch: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
};
export type DefaultFieldConvertOptions<Handle extends new (...args: any) => BaseSchemaHandle<any>> = {
	builder: typeof FormBuilder<CoreSchemaHandle<any, any>>;
	handle?: Handle;
};
export type FieldConvertOptions = SetOptional<ConvertOptions<typeof CoreSchemaHandle<any, any>>, "handle"> & {
	fieldGlobalConfig?: PiCommonConfig;
};
export type FieldConvertViewOptions = FieldConvertOptions & {
	injector: Injector;
};
declare const PI_INPUT_OPTIONS_TOKEN: InjectionToken<() => FieldConvertOptions>;
declare const PI_INPUT_SCHEMA_TOKEN: InjectionToken<() => V.BaseSchema<any, any, any>>;
declare function createConvertToField<Handle extends new (...args: any) => BaseSchemaHandle<any>>(defaultOptions: DefaultFieldConvertOptions<Handle>, defaultInjector?: Injector): <T extends V.BaseSchema<any, any, any>>(schema: () => T, parent?: Injector, options?: () => FieldConvertOptions | undefined, providers?: Provider[]) => _PiResolvedCommonViewFieldConfig<V.InferOutput<T>, V.InferOutput<T>, any, InferAliasMap<T>, T, T, any>;
declare const NFCSchema$1: V.OptionalSchema<V.VoidSchema<undefined>, undefined>;
declare function nfcComponent<D>(input: D): V.SchemaWithPipe<readonly [
	V.OptionalSchema<V.VoidSchema<undefined>, undefined>,
	D extends string ? _piying_valibot_visit.DefineTypeAction<undefined> : _piying_valibot_visit.RawConfigAction<"viewRawConfig", undefined, PYVAC.AnyCoreSchemaHandle> & {
		__type: D;
	}
]>;
export interface FieldRenderConfig {
	hidden?: boolean;
}
export type ComponentData<T = any> = {
	inputs: AsyncObjectSignal<ViewInputs>;
	outputs: AsyncObjectSignal<ViewOutputs>;
	attributes: AsyncObjectSignal<ViewAttributes>;
	events: AsyncObjectSignal<ViewEvents>;
	slots: AsyncObjectSignal<ViewSlots>;
	models: AsyncObjectSignal<ViewModels>;
	/** 创建组件时的额外配置,由各前端框架确定泛型,但是仅顶层使用 */
	createOptions?: AsyncObjectSignal<T>;
};
/** 解析后define使用 */
export type CoreResolvedComponentDefine = {
	type: any;
} & Partial<ComponentData>;
export interface HookConfig<RESOLVED_FIELD> {
	/** 配置刚被解析 */
	fieldResolved?: (field: RESOLVED_FIELD) => void;
	/** 所有feilds初始化后执行,也就是可以进行表单监听 */
	allFieldsResolved?: (field: RESOLVED_FIELD) => void;
	/** todo 此hook暂时没有使用到 创建组件之前 */
	beforeCreateComponent?: (field: RESOLVED_FIELD) => void;
	/** todo 此hook暂时没有使用到 组件创建,获取componentRef */
	afterCreateComponent?: (field: RESOLVED_FIELD) => void;
}
/** 去掉 keyPath 的第一个元素 */
export type RestPath<Path extends KeyPath> = Path extends [
	any,
	...infer R
] ? R extends KeyPath ? R : [
] : [
];
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer R) => void ? R : never;
/** 在 schema 中查找第一个 setAlias 的别名 */
export type FindAlias<S> = S extends {
	alias: infer Al;
} ? Al : S extends {
	pipe: infer P extends readonly any[];
} ? FindAliasInPipe<P> : S extends {
	entries: infer E extends Record<string, any>;
} ? FindAliasInEntries<E> : never;
export type FindAliasInPipe<P extends readonly any[]> = P extends readonly [
	infer A,
	...infer R
] ? A extends {
	alias: infer Al;
} ? Al : FindAliasInPipe<R> : never;
export type FindAliasInEntries<E extends Record<string, any>> = {
	[K in keyof E]: FindAlias<E[K]>;
}[keyof E];
/** 提取字段输出类型(非 schema 时兜底为 any) */
export type FieldOutput<F> = F extends V.BaseSchema<unknown, unknown, any> ? V.InferOutput<F> : any;
/** 提取单个字段的别名映射: { [别名]: 字段value类型 } */
export type ExtractFieldMap<F> = FindAlias<F> extends infer Al ? Al extends string ? {
	[key in Al]: FieldOutput<F>;
} : {} : {};
/** 从 root schema 递归提取所有别名 -> 字段类型 映射(any/unknown 及未覆盖的 schema 类型返回 {}) */
export type InferAliasMap<S> = unknown extends S ? {} : S extends {
	entries: infer E extends Record<string, any>;
} ? UnionToIntersection<{
	[K in keyof E]: ExtractFieldMap<E[K]>;
}[keyof E]> : S extends {
	pipe: infer P extends readonly any[];
} ? InferAliasMap<P[0]> : S extends {
	options: infer O extends readonly any[];
} ? UnionToIntersection<InferAliasMap<O[number]>> : {};
/** 从 schema 中按 key 取子 schema(支持对象/数组/pipe/optional 等包裹) */
export type SubSchema<S, K> = unknown extends S ? any : S extends {
	item: infer T;
} ? K extends number ? T : never : S extends {
	entries: infer E extends Record<string, any>;
} ? K extends keyof E ? E[K] : never : S extends {
	pipe: infer P extends readonly any[];
} ? SubSchema<P[0], K> : S extends {
	wrapped: infer W;
} ? SubSchema<W, K> : never;
/** 从 intersect/union schema 中按数字下标取成员 schema */
export type ItemSchema<S, I> = unknown extends S ? any : S extends {
	options: infer O extends readonly any[];
} ? I extends number ? O[I] : never : S extends {
	pipe: infer P extends readonly any[];
} ? ItemSchema<P[0], I> : S extends {
	wrapped: infer W;
} ? ItemSchema<W, I> : never;
/**
 * 根据 keyPath 递归解析出 [value 类型, schema]。
 * Value: 当前字段值类型; Schema: 当前字段 schema。
 * RootValue/RootSchema: 根级; ParentValue/ParentSchema: 父级。
 * - '#' 从根级开始; '..' 从父级开始(单级退回); '@alias' 通过别名查询。
 */
export type Resolve<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path extends KeyPath> = Path extends [
] ? [
	Value,
	Schema
] : Path[0] extends "#" ? Resolve<RootValue, RootSchema, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>> : Path[0] extends ".." ? Resolve<ParentValue, ParentSchema, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>> : Path[0] extends `@${infer Al}` ? Al extends keyof AliasMap ? Resolve<AliasMap[Al], any, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>> : [
	any,
	any
] : Path extends [
	infer K,
	...infer Rest
] ? Rest extends KeyPath ? K extends keyof Value ? Resolve<Value[K], SubSchema<Schema, K>, RootValue, RootSchema, Value, Schema, AliasMap, Rest> : K extends number ? Resolve<FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, RootValue, RootSchema, Value, Schema, AliasMap, Rest> : [
	any,
	any
] : K extends keyof Value ? [
	Value[K],
	SubSchema<Schema, K>
] : K extends number ? [
	FieldOutput<ItemSchema<Schema, K>>,
	ItemSchema<Schema, K>
] : [
	any,
	any
] : [
	any,
	any
];
/** 解析路径末端的 value 类型 */
export type GetPathValue<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path extends KeyPath> = Resolve<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>[0];
/** 解析路径末端的 schema */
export type GetPathSchema<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path extends KeyPath> = Resolve<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>[1];
/** 返回字段的父级值类型: 普通路径的父级是路径倒数第二个 key 的值; 特殊路径无法推导为 any */
export type GetParentValue<Value, Schema, ParentValue, Path extends KeyPath> = Path extends [
] ? ParentValue : Path[0] extends "#" | ".." | `@${string}` ? any : Path extends [
	infer K,
	...infer Rest
] ? Rest extends KeyPath ? Rest extends [
] ? Value : K extends keyof Value ? GetParentValue<Value[K], SubSchema<Schema, K>, ParentValue, Rest> : K extends number ? GetParentValue<FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, ParentValue, Rest> : any : any : any;
/** 返回字段的父级 schema */
export type GetParentSchema<Value, Schema, ParentSchema, Path extends KeyPath> = Path extends [
] ? ParentSchema : Path[0] extends "#" | ".." | `@${string}` ? any : Path extends [
	infer K,
	...infer Rest
] ? Rest extends KeyPath ? Rest extends [
] ? Schema : K extends keyof Value ? GetParentSchema<Value[K], SubSchema<Schema, K>, ParentSchema, Rest> : K extends number ? GetParentSchema<FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, ParentSchema, Rest> : any : any : any;
/** get 的返回字段完整类型(携带正确的 RootValue/ParentValue/AliasMap/Schema) */
export type GetResult<Value, RootValue, ParentValue, AliasMap, Schema, RootSchema, ParentSchema, Path extends KeyPath> = _PiResolvedCommonViewFieldConfig<GetPathValue<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>, RootValue, GetParentValue<Value, Schema, ParentValue, Path>, AliasMap, GetPathSchema<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>, RootSchema, GetParentSchema<Value, Schema, ParentSchema, Path>>;
/** 判断 pipe 中是否包含指定 action type */
export type HasPipeAction<P extends readonly any[], T extends string> = P extends readonly [
	infer A,
	...infer Rest
] ? A extends {
	type: T;
} ? true : HasPipeAction<Rest, T> : false;
/** schema 是否配置了 asControl(强制作为 FieldControl) */
export type IsAsControl<S> = S extends {
	pipe: infer P extends readonly any[];
} ? HasPipeAction<P, "asControl"> : false;
/** schema 是否配置了 asVirtualGroup(强制作为 FieldGroup) */
export type IsAsVirtualGroup<S> = S extends {
	pipe: infer P extends readonly any[];
} ? HasPipeAction<P, "asVirtualGroup"> : false;
/** 递归解包 pipe/wrapped 得到核心 schema */
export type CoreSchemaOf<S> = unknown extends S ? any : [
	S
] extends [
	never
] ? any : S extends {
	pipe: infer P extends readonly any[];
} ? CoreSchemaOf<P[0]> : S extends {
	wrapped: infer W;
} ? CoreSchemaOf<W> : S;
/** 根据核心 schema 与原始 schema 推断控件类型 */
export type SchemaControlOf<C, S, V> = C extends {
	type: "array" | "tuple";
} ? FieldArray<V> : C extends {
	type: "intersect";
} ? IsAsVirtualGroup<S> extends true ? FieldGroup<V> : FieldLogicGroup<V> : C extends {
	type: "union";
} ? FieldLogicGroup<V> : C extends {
	type: "object" | "loose_object" | "strict_object" | "object_with_rest" | "record";
} ? IsAsControl<S> extends true ? FieldControl<V> : FieldGroup<V> : FieldControl<V>;
/** 根据 schema 推断对应表单控件类型 */
export type SchemaToControl<S, V> = unknown extends S ? FieldGroup<V> | FieldArray<V> | FieldControl<V> | FieldLogicGroup<V> : [
	S
] extends [
	never
] ? FieldGroup<V> | FieldArray<V> | FieldControl<V> | FieldLogicGroup<V> : SchemaControlOf<CoreSchemaOf<S>, S, V>;
export type PiResolvedCommonViewFieldConfig<SelfResolvedFn extends () => any, Define, Value = any, RootValue = Value, ParentValue = any, AliasMap = {}, Schema = any, RootSchema = Schema, ParentSchema = any> = {
	readonly hooks: HookConfig<ReturnType<SelfResolvedFn>>;
	readonly id?: string;
	/** 查询时使用 */
	readonly keyPath?: KeyPath | undefined;
	readonly key: string | undefined;
	readonly fullPath: KeyPath;
	readonly props: AsyncObjectSignal<Record<string, any>>;
	children?: Signal<ReturnType<SelfResolvedFn>[]>;
	fixedChildren?: WritableSignal<ReturnType<SelfResolvedFn>[]>;
	restChildren?: WritableSignal<ReturnType<SelfResolvedFn>[]>;
	parent: ReturnType<SelfResolvedFn>;
	readonly form: {
		readonly control?: SchemaToControl<Schema, Value>;
		readonly parent: SchemaToControl<ParentSchema, ParentValue>;
		readonly root: SchemaToControl<RootSchema, RootValue>;
	};
	/** 仅用来开发时debug使用 */
	readonly origin: any;
	injector: Injector;
	/** 外部传入引用 */
	readonly context?: any;
	arrayChild?: CoreSchemaHandle<any, any>;
	get: <K extends KeyPath>(keyPath: [
		...K
	], aliasNotFoundFn?: (name: string, field: PiResolvedCommonViewFieldConfig<any, any>) => PiResolvedCommonViewFieldConfig<any, any>) => GetResult<Value, RootValue, ParentValue, AliasMap, Schema, RootSchema, ParentSchema, K> | undefined;
	action: {
		set: (value: any, index?: any) => boolean;
		remove: (index: any) => void;
	};
	readonly define?: WritableSignal<Define>;
} & Readonly<Pick<AnyCoreSchemaHandle, "priority" | "alias" | "providers">> & {
	readonly inputs: AsyncObjectSignal<ViewInputs>;
	readonly models: AsyncObjectSignal<ViewModels>;
	readonly outputs: AsyncObjectSignal<ViewOutputs>;
	readonly attributes: AsyncObjectSignal<ViewAttributes>;
	readonly events: AsyncObjectSignal<ViewEvents>;
	readonly slots: AsyncObjectSignal<ViewSlots>;
	readonly wrappers: CombineSignal<CoreWrapperConfig>;
} & Readonly<Wrapper$<Required<Pick<AnyCoreSchemaHandle, "formConfig" | "renderConfig">>>>;
export type _PiResolvedCommonViewFieldConfig<Value = any, RootValue = Value, ParentValue = any, AliasMap = {}, Schema = any, RootSchema = Schema, ParentSchema = any> = PiResolvedCommonViewFieldConfig<() => _PiResolvedCommonViewFieldConfig<any>, CoreResolvedComponentDefine, Value, RootValue, ParentValue, AliasMap, Schema, RootSchema, ParentSchema>;
export interface FormBuilderOptions<T> {
	form$$: Signal<FieldGroup>;
	resolvedField$: WritableSignal<T>;
	context: any;
}
export type ViewInputs = Record<string, any>;
export type ViewModels = Record<string, WritableSignal<any>>;
export type ViewOutputs = Record<string, (...args: any[]) => any>;
export type ViewAttributes = Record<string, any>;
export type ViewEvents = Record<string, (event: Event) => any>;
export type ViewProps = Record<string, any>;
export type ViewSlots = Record<string, any>;
export type RawCoreWrapperConfig = {
	type: string | any | LazyImport<any>;
	attributes: ViewAttributes;
	inputs: ViewInputs;
	outputs: ViewOutputs;
	events: ViewEvents;
	slots: ViewSlots;
	models: ViewModels;
};
export type CoreWrapperConfig = {
	type: string | any | LazyImport<any>;
} & ComponentData;
declare class FormBuilder<SchemaHandle extends CoreSchemaHandle<any, any>> {
	#private;
	buildRoot(item: BuildRootInputItem<SchemaHandle>): void;
	allFieldInitHookCall(): void;
	afterResolveConfig(rawConfig: SchemaHandle, config: _PiResolvedCommonViewFieldConfig): _PiResolvedCommonViewFieldConfig | undefined;
}
declare function isGroup(schema: AnyCoreSchemaHandle): boolean | undefined;
declare function isArray(schema: AnyCoreSchemaHandle): boolean;
declare function findError<K extends string>(list: ValidationErrors2[] | undefined, key: K): (K extends ValidationValibotError2["kind"] ? ValidationValibotError2 : K extends ValidationErrorError2["kind"] ? ValidationErrorError2 : ValidationCommonError2) | undefined;
declare class PiyingViewGroupBase {
	field$$: _angular_core.Signal<PYVAC._PiResolvedCommonViewFieldConfig>;
	props$$: _angular_core.Signal<Record<string, any>>;
	children$$: _angular_core.Signal<PYVAC._PiResolvedCommonViewFieldConfig<any, any, any, {}, any, any, any>[]>;
	fixedChildren$$: _angular_core.Signal<PYVAC._PiResolvedCommonViewFieldConfig<any, any, any, {}, any, any, any>[]>;
	restChildren$$: _angular_core.Signal<PYVAC._PiResolvedCommonViewFieldConfig<any, any, any, {}, any, any, any>[]>;
	fieldTemplateRef: _angular_core.TemplateRef<any> | null;
	injector: Injector;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<PiyingViewGroupBase, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<PiyingViewGroupBase, never, never, {}, {}, never, never, true, never>;
}
declare class PiyingViewGroup extends PiyingViewGroupBase {
	static __version: number;
	templateRef: _angular_core.Signal<unknown>;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<PiyingViewGroup, never>;
	static ɵcmp: _angular_core.ɵɵComponentDeclaration<PiyingViewGroup, "piying-view-group", never, {}, {}, never, never, true, never>;
}
export type DirectiveConfig<T = any> = {
	/** string表示是标签,type<any>是组件或者指令 */
	type: Type<T>;
	inputs?: AsyncObjectSignal<ViewInputs>;
	outputs?: AsyncObjectSignal<ViewOutputs>;
	events?: AsyncObjectSignal<ViewEvents>;
	model?: AsyncObjectSignal<Record<string, WritableSignal<any>>>;
	attributes?: AsyncObjectSignal<ViewAttributes>;
};
/** 指令配置 */
export type NgDirectiveConfig = DirectiveConfig;
/** 用于全局可选配置 */
/** 解析后但是未加载 */
export type NgResolvedComponentDefine1 = Omit<CoreResolvedComponentDefine, "type"> & {
	type: Type<any> | LazyImport<Type<any>> | NgComponentDefine | LazyImport<NgComponentDefine> | LazyMarkType<Type<any>> | LazyMarkType<NgComponentDefine>;
};
export type PiResolvedViewFieldConfig = PiResolvedCommonViewFieldConfig<() => PiResolvedViewFieldConfig, NgResolvedComponentDefine1> & {
	directives?: CombineSignal<NgDirectiveConfig>;
};
export type NgResolvedWraaperConfig = Omit<CoreWrapperConfig, "">;
export type ComponentRawType = Type<any> | LazyImport<Type<any>> | NgComponentDefine | LazyImport<NgComponentDefine> | LazyMarkType<Type<any>> | LazyMarkType<NgComponentDefine>;
/** 创建组件时的额外配置,由 angular 框架确定 */
export type NgComponentCreateOptions = {
	hostElement?: Element;
};
export type DynamicComponentConfig = {
	type: Type<any> | LazyImport<Type<any>> | NgComponentDefine | LazyImport<NgComponentDefine> | LazyMarkType<Type<any>> | LazyMarkType<NgComponentDefine>;
	directives: DirectiveConfig[];
	injector?: Injector;
} & ComponentData<NgComponentCreateOptions>;
/** component,wrapper通用定义 */
export type NgComponentDefine = {
	component: Type<any>;
	module?: Type<any>;
};
export type PiViewConfig = PiCommonConfig<Type<any> | LazyImport<Type<any>> | NgComponentDefine | LazyImport<NgComponentDefine> | LazyMarkType<Type<any>> | LazyMarkType<NgComponentDefine>, Type<any> | LazyImport<Type<any>>>;
declare const PI_COMPONENT_INDEX: InjectionToken<number>;
declare const PI_COMPONENT_LIST_LISTEN: InjectionToken<EventEmitter<DynamicComponentConfig[]>>;
declare const PI_VIEW_FIELD_TEMPLATE_REF_TOKEN: InjectionToken<TemplateRef<any>>;
declare const PI_COMPONENT_REF_TOKEN: InjectionToken<ComponentRef<any>>;
export type NgConvertOptions = SetOptional<ConvertOptions<typeof CoreSchemaHandle<any, any>>, "handle"> & {
	builder: typeof FormBuilder<CoreSchemaHandle<any, any>>;
	fieldGlobalConfig?: PiViewConfig;
};
declare class PiyingView implements OnChanges {
	#private;
	readonly templateRef: _angular_core.Signal<unknown>;
	readonly fieldTemplate: _angular_core.Signal<unknown>;
	readonly selectorless: _angular_core.InputSignal<boolean>;
	schema: _angular_core.InputSignal<V.BaseSchema<any, any, any>>;
	model: _angular_core.InputSignal<any>;
	modelChange: _angular_core.OutputEmitterRef<any>;
	options: _angular_core.InputSignal<(Omit<SetOptional<NgConvertOptions, "handle" | "builder">, "fieldGlobalConfig"> & {
		fieldGlobalConfig?: PiViewConfig;
	}) | undefined>;
	form$$: _angular_core.Signal<FieldControl<any> | FieldArray<any, any> | FieldGroup<any, any> | undefined>;
	ngOnChanges(changes: SimpleChanges): void;
	resolvedField$: _angular_core.WritableSignal<PiResolvedViewFieldConfig | undefined>;
	injector3$$: _angular_core.Signal<DestroyableInjector>;
	ngOnDestroy(): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<PiyingView, never>;
	static ɵcmp: _angular_core.ɵɵComponentDeclaration<PiyingView, "piying-view", never, {
		"selectorless": {
			"alias": "selectorless";
			"required": false;
			"isSignal": true;
		};
		"schema": {
			"alias": "schema";
			"required": true;
			"isSignal": true;
		};
		"model": {
			"alias": "model";
			"required": false;
			"isSignal": true;
		};
		"options": {
			"alias": "options";
			"required": false;
			"isSignal": true;
		};
	}, {
		"modelChange": "modelChange";
	}, never, never, true, never>;
}
declare class PiyingCreateComponentBase {
	#private;
	/** 第一次默认为空 */
	protected index: number;
	destroyComponentFn?: () => void;
	fieldComponentInstance?: any;
	fieldElementRef?: ElementRef<HTMLElement>;
	fieldDirectiveRefList?: any[];
	componentRef?: ComponentRef<any>;
	createComponent(list: DynamicComponentConfig[], viewContainerRef: ViewContainerRef): void;
	update(list: DynamicComponentConfig[]): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<PiyingCreateComponentBase, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<PiyingCreateComponentBase, never, never, {}, {}, never, never, true, never>;
}
declare class InsertFieldDirective extends PiyingCreateComponentBase {
	#private;
	insertFieldSlots: _angular_core.InputSignal<Record<string, TemplateRef<any>> | undefined>;
	insertFieldAttributes: _angular_core.InputSignal<Record<string, any> | undefined>;
	createComponent(list?: DynamicComponentConfig[], viewContainerRef?: ViewContainerRef): void;
	ngOnChanges(changes: Record<keyof InsertFieldDirective, SimpleChange>): void;
	ngOnInit(): void;
	ngOnDestroy(): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<InsertFieldDirective, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<InsertFieldDirective, "[insertField]", [
		"insertField"
	], {
		"insertFieldSlots": {
			"alias": "insertFieldSlots";
			"required": false;
			"isSignal": true;
		};
		"insertFieldAttributes": {
			"alias": "insertFieldAttributes";
			"required": false;
			"isSignal": true;
		};
	}, {}, never, never, true, never>;
}
declare class NgSchemaHandle extends CoreSchemaHandle<NgSchemaHandle, () => PiResolvedViewFieldConfig> {
	type: any;
	directives: PYVAC.CombineSignal<NgDirectiveConfig>;
}
declare const rawConfig$1: RawConfigCommon<NgSchemaHandle>;
declare function patchAsyncDirective<T>(type: Type<any>, actions?: RawConfigAction<"viewRawConfig", any, any>[], options?: {
	insertIndex?: number;
}): RawConfigAction<string, T, any>;
declare function removeDirectives<T>(removeList: (list: Signal<NgDirectiveConfig>[]) => Signal<NgDirectiveConfig>[]): RawConfigAction<string, T, any>;
declare const directives: {
	set: <T>(items: SetOptional<SetUnWrapper$<NgDirectiveConfig, "inputs" | "outputs" | "attributes" | "events" | "model">, "inputs" | "outputs" | "attributes" | "events" | "model">[]) => RawConfigAction<string, T, any>;
	patch: <T>(items: SetOptional<SetUnWrapper$<NgDirectiveConfig, "inputs" | "outputs" | "attributes" | "events" | "model">, "inputs" | "outputs" | "attributes" | "events" | "model">[]) => RawConfigAction<string, T, any>;
	patchAsync: typeof patchAsyncDirective;
	remove: typeof removeDirectives;
};
declare const actions$1: {
	directives: {
		set: <T>(items: PYVAC.SetOptional<PYVAC.SetUnWrapper$<PVA.NgDirectiveConfig, "inputs" | "outputs" | "attributes" | "events" | "model">, "inputs" | "outputs" | "attributes" | "events" | "model">[]) => _piying_valibot_visit.RawConfigAction<string, T, any>;
		patch: <T>(items: PYVAC.SetOptional<PYVAC.SetUnWrapper$<PVA.NgDirectiveConfig, "inputs" | "outputs" | "attributes" | "events" | "model">, "inputs" | "outputs" | "attributes" | "events" | "model">[]) => _piying_valibot_visit.RawConfigAction<string, T, any>;
		patchAsync: <T>(type: _angular_core.Type<any>, actions?: _piying_valibot_visit.RawConfigAction<"viewRawConfig", any, any>[], options?: {
			insertIndex?: number;
		}) => _piying_valibot_visit.RawConfigAction<string, T, any>;
		remove: <T>(removeList: (list: _angular_core.Signal<PVA.NgDirectiveConfig>[]) => _angular_core.Signal<PVA.NgDirectiveConfig>[]) => _piying_valibot_visit.RawConfigAction<string, T, any>;
	};
	class: {
		top: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		bottom: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		component: <T>(className: ClassValue, merge?: boolean) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		asyncTop: <T>(classNameFn: PYVAC.AsyncCallback<ClassValue>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		asyncBottom: <T>(fn: PYVAC.AsyncCallback<string>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		asyncComponent: <T>(fn: PYVAC.AsyncCallback<string>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	wrappers: {
		set: <T>(wrappers: (PYVAC.SetOptional<PYVAC.SetUnWrapper$<PYVAC.CoreWrapperConfig, "inputs" | "outputs" | "attributes" | "events" | "slots" | "models">, "inputs" | "outputs" | "attributes" | "events" | "slots" | "models"> | string)[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patch: <T>(wrappers: (PYVAC.SetOptional<PYVAC.SetUnWrapper$<PYVAC.CoreWrapperConfig, "inputs" | "outputs" | "attributes" | "events" | "slots" | "models">, "inputs" | "outputs" | "attributes" | "events" | "slots" | "models"> | string)[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(type: any, actions?: PYVAC.ConfigAction<any>[], options?: {
			insertIndex?: number;
		}) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(removeList: string[] | ((list: _angular_core.Signal<PYVAC.CoreWrapperConfig>[]) => _angular_core.Signal<PYVAC.CoreWrapperConfig>[])) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		changeAsync: <T>(indexFn: (list: _angular_core.Signal<PYVAC.CoreWrapperConfig>[]) => any, actions: PYVAC.ConfigAction<any>[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	hooks: {
		merge: PYVAC.MergeHooksConfig<PYVAC.HookConfig<PYVAC._PiResolvedCommonViewFieldConfig> | undefined>;
		remove: typeof PYVAC.removeHooks;
		set: PYVAC.HooksConfig<PYVAC.HookConfig<PYVAC._PiResolvedCommonViewFieldConfig> | undefined>;
		patch: PYVAC.HooksConfig<PYVAC.HookConfig<PYVAC._PiResolvedCommonViewFieldConfig> | undefined>;
	};
	providers: {
		set: typeof PYVAC.ɵsetProviders;
		patch: typeof PYVAC.ɵpatchProviders;
		change: typeof PYVAC.ɵchangeProviders;
	};
	inputs: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	models: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	outputs: {
		patch: <T>(value: Record<string, (...args: any[]) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, (...args: any[]) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, (field: PYVAC._PiResolvedCommonViewFieldConfig) => (...args: any[]) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		merge: <T>(outputs: Record<string, (...args: any[]) => void>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mergeAsync: <T>(outputs: Record<string, (field: PYVAC._PiResolvedCommonViewFieldConfig) => (...args: any[]) => void>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	attributes: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		top: {
			set: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
			patch: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		};
	};
	events: {
		patch: <T>(value: Record<string, (event: Event) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, (event: Event) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, (field: PYVAC._PiResolvedCommonViewFieldConfig) => (event: Event) => any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	slots: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	props: {
		patch: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: Record<string, any>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		patchAsync: <T>(dataObj: Record<string, PYVAC.AsyncProperty<any>>) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		remove: <T>(list: string[]) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		mapAsync: <T>(fn: (field: PYVAC._PiResolvedCommonViewFieldConfig) => (value: any) => any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
	createOptions: {
		patch: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
		set: <T>(value: any) => _piying_valibot_visit.RawConfigAction<"viewRawConfig", T, PYVAC.AnyCoreSchemaHandle>;
	};
};
declare class AngularFormBuilder extends FormBuilder<NgSchemaHandle> {
	afterResolveConfig(rawConfig: NgSchemaHandle, config: PiResolvedViewFieldConfig): PiResolvedViewFieldConfig;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<AngularFormBuilder, never>;
	static ɵprov: _angular_core.ɵɵInjectableDeclaration<AngularFormBuilder>;
}
declare class BaseControl<T = any> implements ControlValueAccessor$1 {
	#private;
	readonly defaultValue: any;
	value$: _angular_core.WritableSignal<T>;
	protected emitValue?: (value: any) => void;
	registerOnChange(fn: any): void;
	/** 同时发射和value变更 */
	valueChange(value: T, setValue?: boolean): void;
	writeValue(obj: any): void;
	registerOnTouched(fn: any): void;
	touchedChange(): void;
	valueAndTouchedChange(value: T, setValue?: boolean): void;
	disabled$: _angular_core.WritableSignal<boolean>;
	setDisabledState(isDisabled: boolean): void;
}
declare class AttributesDirective {
	#private;
	attributes: _angular_core.InputSignal<Record<string, any>>;
	excludes: _angular_core.InputSignal<string[]>;
	ngOnChanges(changes: SimpleChanges): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<AttributesDirective, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<AttributesDirective, "[attributes]", never, {
		"attributes": {
			"alias": "attributes";
			"required": true;
			"isSignal": true;
		};
		"excludes": {
			"alias": "excludes";
			"required": false;
			"isSignal": true;
		};
	}, {}, never, never, true, never>;
}
declare class EventsDirective {
	#private;
	events: _angular_core.InputSignal<Record<string, (event: any) => any>>;
	ngOnChanges(): void;
	ngOnDestroy(): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<EventsDirective, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<EventsDirective, "[events]", never, {
		"events": {
			"alias": "events";
			"required": true;
			"isSignal": true;
		};
	}, {}, never, never, true, never>;
}
export type GetKeyWithType<T, ValueType> = {
	[K in keyof T as T[K] extends ValueType ? T[K] extends any ? any extends T[K] ? never : K : K : never]: T[K];
};
export type ComponentInputs<Component> = GetKeyWithType<Component, InputSignal<any>>;
export type ComponentInputsOrigin<T> = {
	[K in keyof T]: T[K] extends InputSignal<infer V> ? V : T[K] extends InputSignalWithTransform<infer V, infer D> ? D : never;
};
export type ComponentInputsAsync<T> = {
	[K in keyof T]: T[K] extends InputSignal<infer V> ? AsyncProperty<V> : T[K] extends InputSignalWithTransform<infer V, infer D> ? AsyncProperty<D> : never;
};
export type ComponentOutputs<Component> = GetKeyWithType<Component, OutputEmitterRef<any>>;
export type ComponentOutputsOrigin<T> = {
	[K in keyof T]: T[K] extends OutputEmitterRef<infer V> ? (input: V) => void : never;
};
export type ComponentOutputsAsync<T> = {
	[K in keyof T]: T[K] extends OutputEmitterRef<infer V> ? AsyncProperty<(input: V) => void> : never;
};
export type ComponentInstance<TComponent> = TComponent extends Type<infer Instance> ? Instance : never;
export type GetComponentInputs<TComponent> = ComponentInputs<ComponentInstance<TComponent>>;
export type GetComponentInputsOrigin<TComponent> = Partial<ComponentInputsOrigin<GetComponentInputs<TComponent>>>;
export type GetComponentInputsAsync<TComponent> = Partial<ComponentInputsAsync<GetComponentInputs<TComponent>>>;
export type GetComponentOutputs<TComponent> = ComponentOutputs<ComponentInstance<TComponent>>;
export type GetComponentOutputsOrigin<TComponent> = Partial<ComponentOutputsOrigin<GetComponentOutputs<TComponent>>>;
export type GetComponentOutputsAsync<TComponent> = Partial<ComponentOutputsAsync<GetComponentOutputs<TComponent>>>;
export type ReturnAction<Input> = RawConfigAction<"viewRawConfig", Input, AnyCoreSchemaHandle>;
export type ComponentActions<TComponent> = {
	inputs: {
		patch: <Input>(value: GetComponentInputsOrigin<TComponent>) => ReturnAction<Input>;
		set: <Input>(value: GetComponentInputsOrigin<TComponent>) => ReturnAction<Input>;
		patchAsync: <Input>(value: GetComponentInputsAsync<TComponent>) => ReturnAction<Input>;
		remove: <Input>(value: (keyof GetComponentInputs<TComponent>)[]) => ReturnAction<Input>;
		mapAsync: <Input>(value: (field: _PiResolvedCommonViewFieldConfig) => (value: GetComponentInputs<TComponent>) => GetComponentInputs<TComponent>) => ReturnAction<Input>;
	};
	outputs: {
		patch: <Input>(value: GetComponentOutputsOrigin<TComponent>) => ReturnAction<Input>;
		set: <Input>(value: GetComponentOutputsOrigin<TComponent>) => ReturnAction<Input>;
		patchAsync: <Input>(value: GetComponentOutputsAsync<TComponent>) => ReturnAction<Input>;
		remove: <Input>(value: (keyof GetComponentOutputs<TComponent>)[]) => ReturnAction<Input>;
		mapAsync: <Input>(value: (field: _PiResolvedCommonViewFieldConfig) => (value: GetComponentOutputs<TComponent>) => GetComponentOutputs<TComponent>) => ReturnAction<Input>;
	};
};
export type ActionComponent<A extends PiTypeConfig> = A["type"] extends Type<any> ? A["type"] : NonNullable<A["actions"]>[0]["__type"];
declare function typedComponent<T extends PiCommonConfig>(input: T): {
	define: T;
	setComponent: <TCName extends keyof T["types"] | Type<any>, K>(input: TCName, fn?: (actions: Omit<typeof actions$1, "inputs" | "outputs"> & ComponentActions<TCName extends keyof T["types"] ? ActionComponent<NonNullable<T["types"]>[TCName]> : TCName>) => any[]) => MetadataListAction<K>;
	nfcComponent: <TCName extends keyof T["types"] | Type<any>>(input: TCName, fn?: (actions: Omit<typeof actions$1, "inputs" | "outputs"> & ComponentActions<TCName extends keyof T["types"] ? ActionComponent<NonNullable<T["types"]>[TCName]> : TCName>) => any[]) => V.SchemaWithPipe<readonly [
		V.OptionalSchema<V.VoidSchema<undefined>, undefined>,
		MetadataListAction<void | undefined>
	]>;
};
declare class FieldControlBase implements OnDestroy {
	#private;
	fieldControl$$: Signal<FieldControl>;
	readonly cvaArray: ControlValueAccessor$1[];
	readonly injector: Injector;
	get cva(): ControlValueAccessor$1;
	get ngControl(): NgControl;
	ngOnChanges(): void;
	/** @docs-private */
	ngOnDestroy(): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<FieldControlBase, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<FieldControlBase, never, never, {}, {}, never, never, true, never>;
}
declare class PiyingFieldControlBindDirective extends FieldControlBase {
	formControl: _angular_core.InputSignal<_PiResolvedCommonViewFieldConfig>;
	path: _angular_core.InputSignal<KeyPath | undefined>;
	field$$: _angular_core.Signal<_PiResolvedCommonViewFieldConfig | undefined>;
	fieldControl$$: _angular_core.Signal<PYVAC.FieldControl<any>>;
	summaryList$$: _angular_core.Signal<PYVAC.ErrorSummary[]>;
	valibotIssueSummary$$: _angular_core.Signal<string>;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<PiyingFieldControlBindDirective, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<PiyingFieldControlBindDirective, "[formControl]", [
		"formControl"
	], {
		"formControl": {
			"alias": "formControl";
			"required": true;
			"isSignal": true;
		};
		"path": {
			"alias": "path";
			"required": false;
			"isSignal": true;
		};
	}, {}, never, never, true, never>;
}
declare abstract class DynamicCreateDirective extends PiyingCreateComponentBase {
	#private;
	abstract field: Signal<PiResolvedViewFieldConfig>;
	abstract inputInjector: Signal<Injector>;
	index: number;
	constructor();
	ngOnChanges(): void;
	ngOnDestroy(): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<DynamicCreateDirective, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<DynamicCreateDirective, never, never, {}, {}, never, never, true, never>;
}
declare class PiyingFieldTemplateDirective extends DynamicCreateDirective {
	#private;
	readonly fieldTemplate: _angular_core.InputSignal<PiResolvedViewFieldConfig>;
	readonly path: _angular_core.InputSignal<KeyPath | undefined>;
	onInit: _angular_core.InputSignal<((field: PiResolvedViewFieldConfig) => void) | undefined>;
	injector: Injector;
	field$$: _angular_core.Signal<PiResolvedViewFieldConfig | undefined>;
	field: _angular_core.Signal<PiResolvedViewFieldConfig>;
	inputInjector: _angular_core.Signal<Injector>;
	summaryList$$: _angular_core.Signal<PYVAC.ErrorSummary[]>;
	valibotIssueSummary$$: _angular_core.Signal<string>;
	ngOnChanges(): void;
	static ɵfac: _angular_core.ɵɵFactoryDeclaration<PiyingFieldTemplateDirective, never>;
	static ɵdir: _angular_core.ɵɵDirectiveDeclaration<PiyingFieldTemplateDirective, "[fieldTemplate]", [
		"fieldTemplate"
	], {
		"fieldTemplate": {
			"alias": "fieldTemplate";
			"required": true;
			"isSignal": true;
		};
		"path": {
			"alias": "path";
			"required": false;
			"isSignal": true;
		};
		"onInit": {
			"alias": "onInit";
			"required": false;
			"isSignal": true;
		};
	}, {}, never, never, true, never>;
}
declare const convertToField: <T extends V.BaseSchema<any, any, any>>(schema: () => T, parent?: _angular_core.Injector, options?: (() => PYVAC.FieldConvertOptions | undefined) | undefined, providers?: _angular_core.Provider[]) => PYVAC._PiResolvedCommonViewFieldConfig<V.InferOutput<T>, V.InferOutput<T>, any, PYVAC.InferAliasMap<T>, T, T, any>;
declare class FocusDirective$1 {
	#private;
	selector: import("@angular/core").InputSignal<string | undefined>;
	focus: import("@angular/core").InputSignal<boolean | undefined>;
	ngOnChanges(changes: SimpleChanges): void;
}
/** 与 code-eval.ts 注入到用户代码中的变量保持一致 */
declare global {
	export const v: typeof V;
	export const NFCSchema: (typeof PYVAC)["NFCSchema"];
	export const setComponent: (typeof PYVAC)["setComponent"];
	export const disableWhen: (typeof PYVAC)["disableWhen"];
	export const hideWhen: (typeof PYVAC)["hideWhen"];
	export const rawConfig: (typeof PYVAC)["rawConfig"];
	export const outputChange: (typeof PYVAC)["outputChange"];
	export const actions: (typeof PVA)["actions"];
	export const valueChange: (typeof PYVAC)["valueChange"];
	export const setAlias: (typeof PYVAC)["setAlias"];
	export const layout: (typeof PYVAC)["layout"];
	export const asVirtualGroup: (typeof PYVAC)["asVirtualGroup"];
	export const nonFieldControl: (typeof PYVAC)["nonFieldControl"];
	export const asControl: (typeof PYVAC)["asControl"];
	export const condition: (typeof PYVAC)["condition"];
	export const renderConfig: (typeof PYVAC)["renderConfig"];
	export const formConfig: (typeof PYVAC)["formConfig"];
	export const map: (typeof rxjs)["map"];
	export const skip: (typeof rxjs)["skip"];
	export const tap: (typeof rxjs)["tap"];
	export const of: (typeof rxjs)["of"];
	export const pipe: (typeof rxjs)["pipe"];
	export const debounceTime: (typeof rxjs)["debounceTime"];
	export const BehaviorSubject: (typeof rxjs)["BehaviorSubject"];
	export const FocusDirective: (typeof directive)["FocusDirective"];
}

declare namespace directive {
	export { FocusDirective$1 as FocusDirective };
}
declare namespace V {
	export { AnySchema, ArgsAction, ArgsActionAsync, ArrayInput, ArrayIssue, ArrayPathItem, ArrayRequirement, ArrayRequirementAsync, ArraySchema, ArraySchemaAsync, AwaitActionAsync, BASE64_REGEX, BIC_REGEX, Base64Action, Base64Issue, BaseIssue, BaseMetadata, BaseSchema, BaseSchemaAsync, BaseTransformation, BaseTransformationAsync, BaseValidation, BaseValidationAsync, BicAction, BicIssue, BigintIssue, BigintSchema, BlobIssue, BlobSchema, BooleanIssue, BooleanSchema, Brand, BrandAction, BrandName, BrandSymbol, BytesAction, BytesIssue, CUID2_REGEX, Cache$1 as Cache, CacheConfig, CheckAction, CheckActionAsync, CheckIssue, CheckItemsAction, CheckItemsActionAsync, CheckItemsIssue, Class, Config, ContentInput, ContentRequirement, CreditCardAction, CreditCardIssue, Cuid2Action, Cuid2Issue, CustomIssue, CustomSchema, CustomSchemaAsync, DECIMAL_REGEX, DIGITS_REGEX, DOMAIN_REGEX, DateIssue, DateSchema, DecimalAction, DecimalIssue, Default, DefaultAsync, DefaultValue, DescriptionAction, DigitsAction, DigitsIssue, DomainAction, DomainIssue, EMAIL_REGEX, EMOJI_REGEX, EmailAction, EmailIssue, EmojiAction, EmojiIssue, EmptyAction, EmptyIssue, EndsWithAction, EndsWithIssue, EntriesAction, EntriesInput, EntriesIssue, Enum, EnumIssue, EnumSchema, EnumValues, ErrorMessage, EveryItemAction, EveryItemIssue, ExactOptionalSchema, ExactOptionalSchemaAsync, ExamplesAction, ExcludesAction, ExcludesIssue, FailureDataset, Fallback, FallbackAsync, FileIssue, FileSchema, FilterItemsAction, FindItemAction, FiniteAction, FiniteIssue, FlatErrors, Flavor, FlavorAction, FlavorName, FlavorSymbol, FunctionIssue, FunctionSchema, GenericIssue, GenericMetadata, GenericPipeAction, GenericPipeActionAsync, GenericPipeItem, GenericPipeItemAsync, GenericSchema, GenericSchemaAsync, GenericTransformation, GenericTransformationAsync, GenericValidation, GenericValidationAsync, GlobalConfig, GraphemesAction, GraphemesIssue, GtValueAction, GtValueIssue, GuardAction, GuardFunction, GuardIssue, HEXADECIMAL_REGEX, HEX_COLOR_REGEX, HashAction, HashIssue, HashType, HexColorAction, HexColorIssue, HexadecimalAction, HexadecimalIssue, IMEI_REGEX, IPV4_REGEX, IPV6_REGEX, IP_REGEX, ISO_DATE_REGEX, ISO_DATE_TIME_REGEX, ISO_DATE_TIME_SECOND_REGEX, ISO_TIMESTAMP_REGEX, ISO_TIME_REGEX, ISO_TIME_SECOND_REGEX, ISO_WEEK_REGEX, ISRC_REGEX, ImeiAction, ImeiIssue, IncludesAction, IncludesIssue, InferDefault, InferDefaults, InferExamples, InferFallback, InferFallbacks, InferGuardOutput, InferInput, InferIssue, InferMetadata, InferOutput, InstanceIssue, InstanceSchema, IntegerAction, IntegerIssue, IntersectIssue, IntersectOptions, IntersectOptionsAsync, IntersectSchema, IntersectSchemaAsync, IpAction, IpIssue, Ipv4Action, Ipv4Issue, Ipv6Action, Ipv6Issue, IsbnAction, IsbnIssue, IsoDateAction, IsoDateIssue, IsoDateTimeAction, IsoDateTimeIssue, IsoDateTimeSecondAction, IsoDateTimeSecondIssue, IsoTimeAction, IsoTimeIssue, IsoTimeSecondAction, IsoTimeSecondIssue, IsoTimestampAction, IsoTimestampIssue, IsoWeekAction, IsoWeekIssue, IsrcAction, IsrcIssue, IssueDotPath, IssuePathItem, JWS_COMPACT_REGEX, JwsCompactAction, JwsCompactIssue, LazySchema, LazySchemaAsync, LengthAction, LengthInput, LengthIssue, Literal, LiteralIssue, LiteralSchema, LooseObjectIssue, LooseObjectSchema, LooseObjectSchemaAsync, LooseTupleIssue, LooseTupleSchema, LooseTupleSchemaAsync, LtValueAction, LtValueIssue, MAC48_REGEX, MAC64_REGEX, MAC_REGEX, Mac48Action, Mac48Issue, Mac64Action, Mac64Issue, MacAction, MacIssue, MapIssue, MapItemsAction, MapPathItem, MapSchema, MapSchemaAsync, MaxBytesAction, MaxBytesIssue, MaxEntriesAction, MaxEntriesIssue, MaxGraphemesAction, MaxGraphemesIssue, MaxLengthAction, MaxLengthIssue, MaxSizeAction, MaxSizeIssue, MaxValueAction, MaxValueIssue, MaxWordsAction, MaxWordsIssue, MetadataAction, MimeTypeAction, MimeTypeIssue, MinBytesAction, MinBytesIssue, MinEntriesAction, MinEntriesIssue, MinGraphemesAction, MinGraphemesIssue, MinLengthAction, MinLengthIssue, MinSizeAction, MinSizeIssue, MinValueAction, MinValueIssue, MinWordsAction, MinWordsIssue, MultipleOfAction, MultipleOfIssue, NANO_ID_REGEX, NanIssue, NanSchema, NanoIDAction, NanoIDIssue, NanoIdAction, NanoIdIssue, NeverIssue, NeverSchema, NonEmptyAction, NonEmptyIssue, NonNullableIssue, NonNullableSchema, NonNullableSchemaAsync, NonNullishIssue, NonNullishSchema, NonNullishSchemaAsync, NonOptionalIssue, NonOptionalSchema, NonOptionalSchemaAsync, NormalizeAction, NormalizeForm, NotBytesAction, NotBytesIssue, NotEntriesAction, NotEntriesIssue, NotGraphemesAction, NotGraphemesIssue, NotLengthAction, NotLengthIssue, NotSizeAction, NotSizeIssue, NotValueAction, NotValueIssue, NotValuesAction, NotValuesIssue, NotWordsAction, NotWordsIssue, NullIssue, NullSchema, NullableSchema, NullableSchemaAsync, NullishSchema, NullishSchemaAsync, NumberIssue, NumberSchema, OCTAL_REGEX, ObjectEntries, ObjectEntriesAsync, ObjectIssue, ObjectKeys, ObjectPathItem, ObjectSchema, ObjectSchemaAsync, ObjectWithRestIssue, ObjectWithRestSchema, ObjectWithRestSchemaAsync, OctalAction, OctalIssue, OptionalSchema, OptionalSchemaAsync, OutputDataset, ParseBooleanAction, ParseBooleanConfig, ParseBooleanIssue, ParseJsonAction, ParseJsonConfig, ParseJsonIssue, Parser, ParserAsync, PartialCheckAction, PartialCheckActionAsync, PartialCheckIssue, PartialDataset, PicklistIssue, PicklistOptions, PicklistSchema, PipeAction, PipeActionAsync, PipeItem, PipeItemAsync, PromiseIssue, PromiseSchema, RFC_EMAIL_REGEX, RawCheckAction, RawCheckActionAsync, RawCheckAddIssue, RawCheckContext, RawCheckIssue, RawCheckIssueInfo, RawTransformAction, RawTransformActionAsync, RawTransformAddIssue, RawTransformContext, RawTransformIssue, RawTransformIssueInfo, ReadonlyAction, RecordIssue, RecordSchema, RecordSchemaAsync, ReduceItemsAction, RegexAction, RegexIssue, ReturnsAction, ReturnsActionAsync, RfcEmailAction, RfcEmailIssue, SLUG_REGEX, SafeIntegerAction, SafeIntegerIssue, SafeParseResult, SafeParser, SafeParserAsync, SchemaWithCache, SchemaWithCacheAsync, SchemaWithFallback, SchemaWithFallbackAsync, SchemaWithOmit, SchemaWithPartial, SchemaWithPartialAsync, SchemaWithPick, SchemaWithPipe, SchemaWithPipeAsync, SchemaWithRequired, SchemaWithRequiredAsync, SchemaWithoutPipe, SetIssue, SetPathItem, SetSchema, SetSchemaAsync, SizeAction, SizeInput, SizeIssue, SlugAction, SlugIssue, SomeItemAction, SomeItemIssue, SortItemsAction, StandardProps, StartsWithAction, StartsWithIssue, StrictObjectIssue, StrictObjectSchema, StrictObjectSchemaAsync, StrictTupleIssue, StrictTupleSchema, StrictTupleSchemaAsync, StringIssue, StringSchema, StringifyJsonAction, StringifyJsonConfig, StringifyJsonIssue, SuccessDataset, SymbolIssue, SymbolSchema, TitleAction, ToBigintAction, ToBigintIssue, ToBooleanAction, ToCamelCaseAction, ToDateAction, ToDateIssue, ToKebabCaseAction, ToLowerCaseAction, ToMaxValueAction, ToMinValueAction, ToNumberAction, ToNumberIssue, ToPascalCaseAction, ToSnakeCaseAction, ToStringAction, ToStringIssue, ToUpperCaseAction, TransformAction, TransformActionAsync, TrimAction, TrimEndAction, TrimStartAction, TupleIssue, TupleItems, TupleItemsAsync, TupleSchema, TupleSchemaAsync, TupleWithRestIssue, TupleWithRestSchema, TupleWithRestSchemaAsync, ULID_REGEX, UUID_REGEX, UlidAction, UlidIssue, UndefinedIssue, UndefinedSchema, UndefinedableSchema, UndefinedableSchemaAsync, UnionIssue, UnionOptions, UnionOptionsAsync, UnionSchema, UnionSchemaAsync, UnknownDataset, UnknownPathItem, UnknownSchema, UrlAction, UrlIssue, UuidAction, UuidIssue, ValiError, ValueAction, ValueInput, ValueIssue, ValuesAction, ValuesIssue, VariantIssue, VariantOptions, VariantOptionsAsync, VariantSchema, VariantSchemaAsync, VoidIssue, VoidSchema, WordsAction, WordsIssue, _addIssue, _cloneDataset, _formatCase, _getByteCount, _getGraphemeCount, _getLastMetadata, _getStandardProps, _getWordCount, _isLuhnAlgo, _isValidObjectKey, _joinExpects, _stringify, any, args, argsAsync, array, arrayAsync, assert, awaitAsync, base64, bic, bigint, blob, boolean, brand, bytes, cache, cacheAsync, check, checkAsync, checkItems, checkItemsAsync, config, creditCard, cuid2, custom, customAsync, date, decimal, deleteGlobalConfig, deleteGlobalMessage, deleteSchemaMessage, deleteSpecificMessage, description, digits, domain, email, emoji, empty, endsWith, entries, entriesFromList, entriesFromObjects, enum_, enum_ as enum, everyItem, exactOptional, exactOptionalAsync, examples, excludes, fallback, fallbackAsync, file, filterItems, findItem, finite, flatten, flavor, forward, forwardAsync, function_, function_ as function, getDefault, getDefaults, getDefaultsAsync, getDescription, getDotPath, getExamples, getFallback, getFallbacks, getFallbacksAsync, getGlobalConfig, getGlobalMessage, getMetadata, getSchemaMessage, getSpecificMessage, getTitle, graphemes, gtValue, guard, hash, hexColor, hexadecimal, imei, includes, instance, integer, intersect, intersectAsync, ip, ipv4, ipv6, is, isOfKind, isOfType, isValiError, isbn, isoDate, isoDateTime, isoDateTimeSecond, isoTime, isoTimeSecond, isoTimestamp, isoWeek, isrc, jwsCompact, keyof, lazy, lazyAsync, length$1 as length, literal, looseObject, looseObjectAsync, looseTuple, looseTupleAsync, ltValue, mac, mac48, mac64, map$1 as map, mapAsync, mapItems, maxBytes, maxEntries, maxGraphemes, maxLength, maxSize, maxValue, maxWords, message, metadata, mimeType, minBytes, minEntries, minGraphemes, minLength, minSize, minValue, minWords, multipleOf, nan, nanoid, never, nonEmpty, nonNullable, nonNullableAsync, nonNullish, nonNullishAsync, nonOptional, nonOptionalAsync, normalize, notBytes, notEntries, notGraphemes, notLength, notSize, notValue, notValues, notWords, null_, null_ as null, nullable, nullableAsync, nullish, nullishAsync, number, object, objectAsync, objectWithRest, objectWithRestAsync, octal, omit, optional, optionalAsync, parse, parseAsync, parseBoolean, parseJson, parser, parserAsync, partial, partialAsync, partialCheck, partialCheckAsync, pick, picklist, pipe$1 as pipe, pipeAsync, promise, rawCheck, rawCheckAsync, rawTransform, rawTransformAsync, readonly, record, recordAsync, reduceItems, regex, required, requiredAsync, returns, returnsAsync, rfcEmail, safeInteger, safeParse, safeParseAsync, safeParser, safeParserAsync, set, setAsync, setGlobalConfig, setGlobalMessage, setSchemaMessage, setSpecificMessage, size, slug, someItem, sortItems, startsWith, strictObject, strictObjectAsync, strictTuple, strictTupleAsync, string, stringifyJson, summarize, symbol, title, toBigint, toBoolean, toCamelCase, toDate, toKebabCase, toLowerCase, toMaxValue, toMinValue, toNumber, toPascalCase, toSnakeCase, toString$1 as toString, toUpperCase, transform, transformAsync, trim, trimEnd, trimStart, tuple, tupleAsync, tupleWithRest, tupleWithRestAsync, ulid, undefined_, undefined_ as undefined, undefinedable, undefinedableAsync, union, unionAsync, unknown, unwrap, url, uuid, value, values, variant, variantAsync, void_, void_ as void, words };
}
declare namespace PVA {
	export { AngularFormBuilder, AttributesDirective, BaseControl, ComponentRawType, EventsDirective, InsertFieldDirective, NgDirectiveConfig, NgResolvedComponentDefine1, NgResolvedWraaperConfig, NgSchemaHandle, PI_COMPONENT_INDEX, PI_COMPONENT_LIST_LISTEN, PI_COMPONENT_REF_TOKEN, PI_INPUT_OPTIONS_TOKEN, PI_INPUT_SCHEMA_TOKEN, PI_VIEW_FIELD_TEMPLATE_REF_TOKEN, PI_VIEW_FIELD_TOKEN, PiResolvedViewFieldConfig, PiViewConfig, PiyingCreateComponentBase, PiyingFieldControlBindDirective, PiyingFieldTemplateDirective, PiyingView, PiyingViewGroup, PiyingViewGroupBase, actions$1 as actions, asControl$1 as asControl, asVirtualGroup$1 as asVirtualGroup, condition$1 as condition, convertToField, directives, layout$1 as layout, rawConfig$1 as rawConfig, typedComponent };
}
declare namespace PYVAC {
	export { AbstractControl, AbstractControlParams, AnyCoreSchemaHandle, ArraryIterable, ArrayDeletionMode, AsyncCallback, AsyncObjectSignal, AsyncProperty, AsyncValidatorFn, BuildArrayItem, BuildGroupItem, BuildRootInputItem, BuildRootItem, CombineSignal, ComponentData, ConfigAction, ControlValueAccessor, CoreResolvedComponentDefine, CoreSchemaHandle, CoreWrapperConfig, CustomDataSymbol, DefaultFieldConvertOptions, DisableWhenOption, DisabledValueStrategy, ErrorSummary, EventChangeFn, FieldArray, FieldArrayConfig$, FieldControl, FieldConvertOptions, FieldConvertViewOptions, FieldFormConfig, FieldFormConfig$, FieldGroup, FieldGroupConfig$, FieldLogicGroup, FieldLogicGroupConfig$, FieldRenderConfig, FieldTransformerConfig, FormBuilder, FormBuilderOptions, FormHooks, GetTypeConfig, GetWrapperConfig, HideWhenOption, HookConfig, HooksConfig, INVALID, InferAliasMap, InitPendingValue, InjectorProvider, KeyPath, LayoutAction, LazyImport, LazyMarkType, LogicType, MergeHooksConfig, NFCSchema$1 as NFCSchema, NonFieldControlAction, ObservableSignal, PENDING, PI_CONTEXT_TOKEN, PI_INPUT_OPTIONS_TOKEN, PI_INPUT_SCHEMA_TOKEN, PI_VIEW_CONFIG_TOKEN, PI_VIEW_FIELD_TOKEN, PiCommonConfig, PiResolvedCommonViewFieldConfig, PiTypeConfig, PiWrapperConfig, QueryPath, RawConfig, RawCoreWrapperConfig, RawKeyPath, SetOptional, SetReadonly, SetRequired, SetUnWrapper$, SetWrapper$, SetWrapper$$, SignalInputValue, SortedArray, ToObservableOptions, UnWrapSignal, UnWrapper$, UpdateType, VALID, VALID_STATUS, ValidationCommonError2, ValidationDescendantError2, ValidationErrorError2, ValidationErrors2, ValidationErrorsLegacy, ValidationValibotError2, ValidatorFn, ValueChangFnOptions, ValueChangeFn, ValueEvent, ValueType, ViewAttributes, ViewEvents, ViewInputs, ViewModels, ViewOutputs, ViewProps, ViewSlots, Wrapper$, Writeable, _PiResolvedCommonViewFieldConfig, actions$1 as actions, arrayStartsWith, asControl$1 as asControl, asVirtualGroup$1 as asVirtualGroup, asyncMergeOutputs, asyncObjectSignal, changeObject, changeProviders as ɵchangeProviders, classAction as ɵclassAction, clone, combineSignal, condition$1 as condition, controlStatusList, createConvertToField, createViewControlLink, disableWhen$1 as disableWhen, effectListen, errorSummary, fieldControlStatusClass, findComponent, findError, formConfig$1 as formConfig, getDeepError, getDefaults$1 as getDefaults, getLazyImport, getSchemaByIssuePath, getSchemaMetadata, hideWhen$1 as hideWhen, initListen, isArray, isFieldArray, isFieldControl, isFieldGroup, isFieldLogicGroup, isGroup, isLazyMark, layout$1 as layout, lazyMark, mergeHooks, mergeHooksFn, mergeOutputFn, mergeOutputs, nfcComponent, nonFieldControl$1 as nonFieldControl, observableSignal, outputChange$1 as outputChange, outputChangeFn, patchHooks, patchProviders as ɵpatchProviders, rawConfig$1 as rawConfig, removeHooks, renderConfig$1 as renderConfig, setAlias$1 as setAlias, setComponent$1 as setComponent, setHooks, setProviders as ɵsetProviders, toArray, toObservable, valueChange$1 as valueChange, valueChangeFn, wrappers as ɵwrappers };
}

export {
	PVA,
	PYVAC,
	V,
	directive,
	rxjs,
};

export {};
