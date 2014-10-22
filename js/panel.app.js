/**
 * Simple example of Panel Controller usage.
 * @type {wcef.WCEFPanelController}
 */
var panelController = new wcef.WCEFPanelController();
    panelController.listen(wcef.BACKGROUND_COMMUNICATION_EVENT, _handleBackgroundCommunication);
    panelController.initialise();

function _handleBackgroundCommunication(event)
{
    console.info("[[PANEL]] MESSAGE FROM BACKGROUND :: - "+event.data);
}