export function fetchWithHandler(url: string, options: RequestInit, modal?: boolean) {
    if (options == null) { options = {}; }
    if (options.credentials == null) { options.credentials = "same-origin"; }
    var errorEventName = "Error";
    if (modal) { errorEventName = "ErrorModal"; }
    var warningEventName = "Warning";
    if (modal) { warningEventName = "WarningModal"; }
    var exceptionEncountered = false;
    var exceptionEventDispatched = false;
    var errorMessage = "Unknown error";
    return fetch(url, options)
        /*.then(
            fetchProgress({
                // implement onProgress method
                onProgress(progress: any) {
                    console.log({ progress });
                    // A possible progress report you will get
                    // {
                    //    total: 3333,
                    //    transferred: 3333,
                    //    speed: 3333,
                    //    eta: 33,
                    //    percentage: 33
                    //    remaining: 3333,
                    // }
                },
            })
        )*/
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                // const urlArray = response.url.split("/");
                // if (urlArray[urlArray.length - 1] === "GetDNVGLUser") { window.location.replace("/Session/SignIn"); }

                errorMessage = response.statusText; //default to the standard error message
                switch (true) {
                    case (response.status >= 400 && response.status <= 401): {
                        errorMessage = response.status + " - Bad request.";
                        exceptionEncountered = true;
                    }
                    case (response.status >= 500 && response.status <= 599): {
                        errorMessage = response.status + " - Server error.";
                        exceptionEncountered = true;
                    }
                }
                return response.json();
            }
        })
        .then((response) => {
            if (response.hasError) {
                const event = new CustomEvent(errorEventName, { detail: response.errorMessage });
                window.dispatchEvent(event);
                exceptionEncountered = true;
                exceptionEventDispatched = true;
                return Promise.reject(response.errorMessage);
            } else {
                if (exceptionEncountered) {
                    const event = new CustomEvent(errorEventName, { detail: errorMessage });
                    window.dispatchEvent(event);
                    exceptionEventDispatched = true;
                    return Promise.reject(errorMessage);
                }
                if (response.hasWarning) {
                    const event = new CustomEvent(warningEventName, { detail: response.errorMessage });
                    window.dispatchEvent(event);
                }
                return Promise.resolve(response);
            }
        })
        .catch((response) => {
            if (!response.status) {
                if (!exceptionEncountered) {
                    errorMessage = "Server is not responding. ";
                }
            }

            if (!exceptionEventDispatched) {
                const event = new CustomEvent(errorEventName, { detail: errorMessage });
                window.dispatchEvent(event);
            }
            return Promise.reject(errorMessage);
        });
}


export function expireTester() {
    
}