/**
 * Simple example of Background Controller usage.
 *
 * @type {wcef.WCEFBackgroundController}
 */

var backgroundController = new wcef.WCEFBackgroundController();
    backgroundController.listen(wcef.PANEL_COMMUNICATION_EVENT, _handlePanelCommunication);
    backgroundController.listen(wcef.CONTENT_COMMUNICATION_EVENT, _handleContentScriptCommunication);
    backgroundController.initialise();

function _handlePanelCommunication(event)
{
    console.info("[[BACKGROUND]] MESSAGE FROM BACKGROUND :: - "+event.data);
}

function _handleContentScriptCommunication(event)
{
    console.info("[[BACKGROUND]] MESSAGE FROM CONTENT :: - "+event.data);
}
