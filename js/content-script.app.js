/**
 * Simple example of content controller usage.
 *
 * @type {wcef.WCEFContentController}
 */
var contentController = new wcef.WCEFContentController();
    contentController.listen(wcef.PAGE_COMMUNICATION_EVENT, _handlePageCommunication);
    contentController.listen(wcef.BACKGROUND_COMMUNICATION_EVENT, _handleBackgroundCommunication);
    contentController.initialise();

function _handleBackgroundCommunication(event)
{
    console.info("[[CONTENT]] MESSAGE FROM BACKGROUND :: - "+event.data);
}

function _handlePageCommunication(event)
{
    console.info("[[CONTENT]] MESSAGE FROM PAGE :: - "+event.data);
}