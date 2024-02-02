export const calculateGanttChart = (data) => {
  const outputArray = [];
  let currentCust;
  let startTime;

  data.forEach((item, index) => {
    if (index === 0) {
      // Initialize the first customer
      currentCust = item.customerInService;
      startTime = item.clock;
    } else if (
      item.customerInService !== currentCust ||
      index === data.length - 1
    ) {
      // When a new customer is encountered or at the end of the array
      const endTime =
        index === data.length - 1 ? item.clock + 1 : data[index - 1].clock + 1;

      outputArray.push({
        label: `${currentCust}`,
        start: startTime,
        end: endTime,
      });

      // Update the current customer and start time
      currentCust = item.customerInService;
      startTime = item.clock;
    }
  });
  return outputArray;
};
