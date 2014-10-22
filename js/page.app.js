/**
 * Simple example of Page Controller usage.
 *
 * @type {wcef.WCEFPageController}
 */
var pageController = new wcef.WCEFPageController();
    pageController.listen(wcef.CONTENT_COMMUNICATION_EVENT, _handleContentScriptCommunication);
    pageController.initialise();

function _handleContentScriptCommunication(event)
{
    console.info("[[PAGE]] MESSAGE FROM CONTENT :: - "+event.data);
}