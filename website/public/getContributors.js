const request = require("request");
const fs = require("fs");

const getdatesForContribution = (dateRange) => {
  const today = new Date();
  const priorDate = new Date();
  priorDate.setDate(priorDate.getDate() - dateRange);
  return {
    today,
    priorDate,
    todayTimestamp: today.valueOf(),
    priorDateTimestamp: priorDate.valueOf(),
  };
};

const dateRanges = {
  topContributors: 30, // last 30 days
  newContributors: 60, // last 60 days
};

const rawSql = {
  topContributors:
    "select\n  row_number() over (order by value desc) as \"Rank\",\n  name,\n  value\nfrom\n  shpr_auth\nwhere\n  series = 'hpr_authall'\n  and period = 'm'",
  newContributors:
    "select str, dt from \"snew_contributors_data\" where $__timeFilter(dt) and series = 'ncdall' and period = 'd'",
};

const reqBodyToFetchContributors = (type) => ({
  queries: [
    {
      refId: "A",
      datasourceId: 1,
      rawSql:
        type === "topContributors"
          ? rawSql.topContributors
          : rawSql.newContributors,
      format: "table",
      intervalMs: 86400000,
      maxDataPoints: 1255,
    },
  ],
  range: {
    from:
      type === "topContributors"
        ? `${getdatesForContribution(dateRanges.topContributors).priorDate}`
        : `${getdatesForContribution(dateRanges.newContributors).priorDate}`,
    to: `${getdatesForContribution().today}`,
    raw: {
      from:
        type === "topContributors"
          ? `now-${dateRanges.topContributors}d`
          : `now-${dateRanges.newContributors}d`,
      to: "now",
    },
  },
  from:
    type === "topContributors"
      ? `${
          getdatesForContribution(dateRanges.topContributors).priorDateTimestamp
        }`
      : `${
          getdatesForContribution(dateRanges.newContributors).priorDateTimestamp
        }`,
  to: `${getdatesForContribution().todayTimestamp}`,
});

const settings = (type) => ({
  url: "https://openebs.devstats.cncf.io/api/ds/query",
  method: "POST",
  json: true,
  headers: {
    "Content-Type": "application/json",
  },
  body: reqBodyToFetchContributors(type),
});

const fetchContributors = async () => {
  await request.post(
    settings("topContributors"),
    function (error, response, body) {
      if (error) {
        console.error(error);
        return;
      }
      const data = JSON.stringify(body?.results?.A?.frames[0]?.data?.values[1]);
      data && fs.writeFileSync("src/resources/topContributors.json", data);
    }
  );

  await request.post(
    settings("newContributors"),
    function (error, response, body) {
      if (error) {
        console.error(error);
        return;
      }
      const data = JSON.stringify(
        body?.results?.A?.frames[0]?.data?.values[0]?.reverse()
      );
      data && fs.writeFileSync("src/resources/newContributors.json", data);
    }
  );
};

fetchContributors();
