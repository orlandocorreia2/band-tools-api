import { TrimStringsMiddleware } from '@http/middlewares/trim-strings.middleware';

describe('TrimStringsMiddleware', () => {
  let middleware: TrimStringsMiddleware;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new TrimStringsMiddleware();
    next = jest.fn();
  });

  it('should call next after processing', () => {
    const req = { body: {}, query: {}, params: {} };

    middleware.use(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should trim strings in body, skip numbers and recurse into objects and arrays', () => {
    const req = {
      body: {
        name: '  hello  ',
        count: 42,
        nested: { city: '  world  ' },
        items: ['  a  ', '  b  '],
      },
      query: {},
      params: {},
    };

    middleware.use(req, null, next);

    expect(req.body.name).toBe('hello');
    expect(req.body.count).toBe(42);
    expect(req.body.nested.city).toBe('world');
    // string primitives inside arrays are not trimmed — only object properties are
    expect(req.body.items).toEqual(['  a  ', '  b  ']);
  });

  it('should trim strings in query and params', () => {
    const req = {
      body: {},
      query: { search: '  term  ' },
      params: { id: '  123  ' },
    };

    middleware.use(req, null, next);

    expect(req.query.search).toBe('term');
    expect(req.params.id).toBe('123');
  });

  it('should handle null and undefined values without throwing', () => {
    const req = { body: null, query: undefined, params: {} };

    expect(() => middleware.use(req, null, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  it('should trim strings inside nested arrays of objects', () => {
    const req = {
      body: { list: [{ label: '  item  ' }] },
      query: {},
      params: {},
    };

    middleware.use(req, null, next);

    expect(req.body.list[0].label).toBe('item');
  });
});
