import Cache from "cache";
import makeSynchronous from "make-synchronous";
import axios from 'axios';

class Resolver {
    constructor() {
        this.cache = new Cache();
    }

    get_item(key) {
        const value = this.cache.get(key);
        if (value) {
            return {
                Ok: value,
            };
        } else {
            return null;
        }
    }

    set_item(key, value) {
        this.cache.put(key, value);

        return {
            Ok: null,
        }
    }

    send_http_request(req) {
        const sync_req = makeSynchronous(async (req) => {
            const axios = await import('axios');

            return axios.default({
                method: req.method,
                url: req.url,
                headers: {
                    'Content-type': 'application/json'
                },
                data: JSON.parse(req.body),
              })
              .then(resp => {
                  return {
                      Ok: {
                          "status": 200,
                          "response": JSON.stringify(resp.data),
                      }
                  };
              })
              .catch(err => {
                  return {
                      Err: err.toString(),
                  };
              });
        });

        return sync_req(req);
    }
}

export let resolver = new Resolver();
