/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Business-Logic-Server
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const PopulateSkills = require('./populate')

class Utility {
    constructor() {
        this.populate = PopulateSkills
    }

    /**
     * @summary a text that will be say by linto
     * 
     * @param {string} toSay string that linto gonna say
     * 
     * @returns {Object} format json that linto gonna read to saying stuff
     */
    formatToSay(toSay) {
        return {
            behavior: toSay
        }
    }

    /**
     * @summary a text that will be ask by linto
     *
     * @param {string} toAsk string that linto gonna say
     * @param {Objet} data data to send at linto
     *
     * @returns {Object} format json that linto gonna read to asking stuff
     */
    formatToAsk(toAsk, data) {
        return {
            ask: toAsk,
            conversationData: data
        }
    }

    /** 
     * @summary Load the json file for language
     * 
     * @param {string} filepath the path of the current skills location
     * @param {string} nodeName the node name
     * @param {string} language language selected by the RED flow
     * 
     * @returns {object} language json 
     **/
    loadLanguage(filepath, nodeName, language) {
        if (language === undefined)
            language = process.env.DEFAULT_LANGUAGE

        filepath = filepath.slice(0, filepath.lastIndexOf("/"));
        return require(filepath + '/locales/' + language + '/' + nodeName)[nodeName].response
    }

    /** 
     * @summary Check if the input from linto match the skills to execute
     * 
     * @param {Object} payload the input message payload receive from the flow
     * @param {string} intent the intent keys of the current skills
     * @param {boolean} isConversationalSkill give the information about a conversational skills or not
     * 
     * @returns {Object.isIntent} do the skill will need to be executed
     * @returns {Object.isConversational} do the skill will execute the conversational part
     **/
    intentDetection(payload, intent, isConversationalSkill = false) {
        let output = {
            isIntent: false
        }
        if (isConversationalSkill && !!payload.conversationData && Object.keys(payload.conversationData).length !== 0 && payload.conversationData.intent === intent) {
            output.isIntent = true
            output.isConversational = true
        } else if ((!!payload.conversationData && Object.keys(payload.conversationData).length === 0) && payload.nlu.intent === intent) {
            output.isIntent = true
            output.isConversational = false
        }
        return output
    }

    /** 
     * @summary Check if the input from linto match the multiple intent skills to execute
     * 
     * @param {Object} payload the input message payload receive from the flow
     * @param {Objects} intents A json with all key has intent
     * @param {boolean} isConversationalSkill give the information about a conversational skills or not
     * 
     * @returns {Object.isIntent} do the skill will need to be executed
     * @returns {Object.isConversational} do the skill will execute the conversational part
     * @returns {Object.skill} the name of the skill to execute
     **/
    multipleIntentDetection(payload, intents, isConversationalSkill = false) {
        let output = {
            isIntent: false,
        }
        if (isConversationalSkill && !!payload.conversationData && Object.keys(payload.conversationData).length !== 0 && intents.hasOwnProperty(payload.conversationData.intent)) {
            output.isIntent = true
            output.isConversational = true
            output.skill = payload.conversationData.intent
        } else if ((!!payload.conversationData && Object.keys(payload.conversationData).length === 0) && intents.hasOwnProperty(payload.nlu.intent)) {
            output.isIntent = true
            output.isConversational = false
            output.skill = payload.nlu.intent
        }
        return output
    }

    /** 
     * @summary Extract the first entities by prefix
     * 
     * @param {Object} payload the input message payload receive from the flow
     * @param {String} prefix the prefix to the entitie to find
     * 
     * @returns {Object} The entities found or nothing
     **/
    extractEntityFromPrefix(payload, prefix) {
        for (let entity of payload.nlu.entities) {
            if (entity.entity.includes(prefix)) {
                return entity
            }
        }
        return undefined
    }

    /** 
     * @summary Extract the first entities by entitiesname
     * 
     * @param {Object} payload the input message payload receive from the flow
     * @param {String} prefix the prefix to the entitie to find
     * 
     * @returns {Object} The entities found or nothing
     **/
    extractEntityFromType(payload, entityName) {
        for (let entity of payload.nlu.entities) {
            if (entity.entity === entityName) {
                return entity
            }
        }
        return undefined
    }

    /** 
     * @summary Check if all require data is in the payload message
     * 
     * @param {Object} payload the input message payload receive from the flow
     * @param {String} prefix the prefix to the entitie to find
     * 
     * @returns {Boolean} Give the information if all entities is here
     **/
    checkEntitiesRequire(payload, requireArrayEntities = []) {
        if (payload.nlu.entitiesNumber === requireArrayEntities.length) {
            for (let entity of payload.nlu.entities) {
                if (requireArrayEntities.indexOf(entity.entity) === -1)
                    return false
            }
            return true
        }
        return false
    }

    /**
     * @summary Add the data to the NLU
     *
     * @param {Object} tockConfig configuration about the tock data given by linto-admin, contains user, password and url
     * @param {String} applicationName the input message payload receive from the flow
     * @param {String} skillsDataPath the path file to upload file
     *
     * @returns {Boolean} the result status of the NLU (Natural Language Understanding) injection
     **/
    populateNluSkills(tockConfig, applicationName, skillsDataPath) {
        if (tockConfig.url !== undefined && tockConfig.authToken !== undefined)
            return this.populate.injectNlu(tockConfig, applicationName, skillsDataPath)
        return false
    }

    /**
     * @summary Add the data to the LM
     *
     * @param {Object} lmConfig configuration about the tock data given by linto-admin, contains user, password and url
     * @param {String} applicationName the input message payload receive from the flow
     * @param {String} skillsDataPath the path file to upload file
     *
     * @returns {Boolean} the result status of the LM (Language Model) injection
     **/
    populateLmSkills(lmConfig, applicationName, skillsDataPath) {
        if (lmConfig.url !== undefined)
            this.populate.injectLm(lmConfig, applicationName, skillsDataPath)
    }

}

module.exports = new Utility()