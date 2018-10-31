const ApiUtils = {
    checkStatus: function (response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else if (response.status === 500) { // SERVER ERROR
            let errorContainer = document.getElementById('page-error');
            errorContainer.style.display = 'block';
            errorContainer.innerHTML = 'Error: ' + response.Message;

            setTimeout(function () {
                errorContainer.className = 'hidden';
            }, 5000);
        } else if (response.status === 401) { // NOT AUTHORIZED
            let errorContainer = document.getElementById('page-warning');
            errorContainer.style.display = 'block';
            errorContainer.innerHTML = 'Warning: ' + response.Message;

            setTimeout(function () {
                errorContainer.className = 'hidden';
            }, 5000);
        } else {
            let error = new Error(response.statusText);
            error.message = response;
            throw error;
        }
    }
};

export default { ApiUtils };
