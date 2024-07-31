
class Lichess {

    #apiBaseUrl;


    constructor() {
        this.#apiBaseUrl = 'https://lichess.org/api/';

    }

    // Generic function to get data from a given resource.
    async #getData(resource, responseType) {
        // Wait until the response promise returned by fetch is completed.
        const response = await fetch(resource);

        // Throw an error in case the response status is different from 200 (ie: OK).
        if (response.status !== 200) {
            throw new Error('Couldn\'t fetch the data. status: ' + response.status);
        }

        const type = responseType === undefined ? 'json' : responseType;
        // Wait until the promise returned by the response object is completed.
        const data = await response[type]();

        return data;
    }

    async getPuzzleById(id) {
        const resource = this.#apiBaseUrl + 'puzzle/' + id;  
        const data = await this.#getData(resource);

        return data;
    }
}
