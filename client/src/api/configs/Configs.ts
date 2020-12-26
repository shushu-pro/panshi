type Configs ={
  url: string;
  method?: 'get' | 'post';
  mock?: (any) => any;
  requestData?: { [k: string]: any } | ((param?) => any);
  responseData?: { [k: string]: any } | ((param?) => any);
  errorIgnore?: boolean;
  errorMessageIgnore?: boolean;
} | {
  [key: string]: Configs
}

export default Configs;
