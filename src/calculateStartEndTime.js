const Customer = {
  customer: undefined,
  arrivalTime: undefined,
  serviceTime: undefined,
  priority: undefined,
  remainingService: undefined,
  startTime: undefined,
  endTime: undefined,
  isStarted: false,
  turnAroundTime: undefined,
  waitTime: undefined,
  responseTime: undefined,
};

export const calculateStartEndTime = (data) => {
  const customersArray = JSON.parse(JSON.stringify(data));
  const ganttChartArray = [];

  if (!Array.isArray(customersArray) || customersArray.length === 0) {
    console.error("Invalid or empty customersArray");
    return { customersArray: [] };
  }

  const arrivals = new Set(customersArray.map((item) => item?.arrivalTime));

  let currentClock = 0;

  let totalServiceTime = customersArray.reduce(
    (prev, current) => prev + (current?.serviceTime ?? 0),
    0
  );

  let arrivedCustomersArray = [];
  let customerInService = customersArray[0]; // set to none
  let prevCustomerInService; // set to none

  while (totalServiceTime >= 0) {
    if (arrivals.has(currentClock)) {
      arrivedCustomersArray = [
        ...arrivedCustomersArray,
        ...customersArray.filter((item) => item?.arrivalTime === currentClock),
      ];
    }

    if (arrivedCustomersArray.length !== 0) {
      prevCustomerInService = customerInService;
      customerInService = arrivedCustomersArray[0];
      arrivedCustomersArray.forEach((item) => {
        if (item?.priority < customerInService?.priority) {
          customerInService = item;
        }
      });

      if (customerInService?.customer !== prevCustomerInService?.customer) {
        customersArray.forEach((item) => {
          if (
            item?.customer === prevCustomerInService?.customer &&
            item?.remainingService === 0
          ) {
            const indexToBeDeleted = arrivedCustomersArray.findIndex(
              (elem) => elem?.customer === prevCustomerInService?.customer
            );
            if (indexToBeDeleted !== -1) {
              item.endTime = currentClock;
              arrivedCustomersArray.splice(indexToBeDeleted, 1);
            }
          }
        });
      }

      customersArray.forEach((item) => {
        if (item?.customer === customerInService?.customer) {
          if (!item?.isStarted) {
            item.isStarted = true;
            item.startTime = currentClock;
          }

          if (item?.remainingService === 0) {
            const deleteIndex = arrivedCustomersArray.findIndex(
              (elem) => elem?.customer === customerInService?.customer
            );
            if (deleteIndex !== -1) {
              item.endTime = currentClock;
              arrivedCustomersArray.splice(deleteIndex, 1);
            }
            if (totalServiceTime === 0) {
              totalServiceTime = -1;
            }
          } else {
            ganttChartArray.push({
              customerInService: `C ${customerInService.customer}`,
              clock: currentClock,
            });

            currentClock++;
            item.remainingService = item?.remainingService - 1;
            totalServiceTime--;
          }
        }
      });
    } else {
      ganttChartArray.push({
        customerInService: `idle`,
        clock: currentClock,
      });
      currentClock++;
    }
  }

  return { customersArray, ganttChartArray };
};
