const string =
  "2023-05-30T17:20:43.000Z,2023-05-28T13:12:46.000Z,2023-05-28T11:44:57.000Z,2023-05-26T09:44:52.000Z,2023-05-20T11:22:45.000Z,2023-05-16T14:54:44.000Z,2023-05-10T21:40:09.000Z,2023-05-10T20:33:09.000Z,2023-05-10T17:43:53.000Z,2023-05-02T14:32:15.000Z,2023-05-02T14:29:30.000Z,2023-05-02T14:26:04.000Z,2023-05-02T14:22:15.000Z,2023-05-02T14:18:09.000Z,2023-04-22T02:57:06.000Z,2023-04-21T20:30:14.000Z,2023-04-21T17:51:50.000Z,2023-04-21T16:43:07.000Z,2023-04-21T04:17:44.000Z,2023-04-21T04:11:26.000Z,2023-04-20T21:38:58.000Z,2023-04-20T16:34:21.000Z,2023-04-20T16:30:59.000Z,2023-04-20T16:28:21.000Z,2023-04-20T10:27:20.000Z,2023-04-20T04:21:59.000Z,2023-04-19T18:42:59.000Z,2023-04-19T14:54:00.000Z,2023-04-17T19:38:12.000Z,2023-04-15T15:44:42.000Z,2023-04-15T05:13:37.000Z,2023-04-14T01:08:28.000Z,2023-04-13T19:13:02.000Z";

const array = string.split(",");

console.log(
  array.map((item) => {
    return { date: item };
  })
);
