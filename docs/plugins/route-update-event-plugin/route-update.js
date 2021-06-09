import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
export default (function () {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }
  
  return {
    onRouteUpdate() {
        const event = new Event('routeupdated');
        document.dispatchEvent(event);
    },
  };
})();
