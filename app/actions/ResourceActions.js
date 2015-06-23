'use strict';

const AppDispatcher = require('../dispatchers/AppDispatcher');
const ResourceStore = require('../stores/ResourceStore');
const ResourceActionTypes = require('../constants/AppConstants').ResourceActionTypes;

let ResourceActions = {
    receive(success) {
        $.get(`/resource/resources`).done(data => {
            AppDispatcher.dispatch({
                type: ResourceActionTypes.RECEIVE_RESOURCES,
                data: data
            });
            if (success && typeof success === "function") {
                success();
            }
        }).fail(e => {
            console.error(e);
        });
    },

    receiveById(id) {
        let resource = ResourceStore.getResourceById(id);
        if (resource !== null && resource !== undefined) {
            AppDispatcher.dispatch({
                type: ResourceActionTypes.RECEIVE_RESOURCE,
                data: resource
            });
        } else {
            $.get(`/resource/resources/${id}`).done(data => {
                AppDispatcher.dispatch({
                    type: ResourceActionTypes.RECEIVE_RESOURCE,
                    data: data
                });
            }).fail(e => {
                console.error(e);
            });
        }
    },

    bookResource(id, fromTime, toTime, success, fail) {
        $.post(`/resource/resources/${id}/book/${fromTime}/${toTime}`).done(data => {
            AppDispatcher.dispatch({
                type: ResourceActionTypes.BOOK_RESOURCE,
                data: data
            });
            if (success && typeof success === "function") {
                success();
            }
        }).fail(e => {
            console.error(e);
        })
    }
};

module.exports = ResourceActions;
