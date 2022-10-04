export interface ResponseGeneric<T> {
    data: T | null;
    error: string;
    code: number;
}
