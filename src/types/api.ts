export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ApiError {
  detail?: string | Array<{
    type?: string;
    loc?: string[];
    msg?: string;
  }>;
}