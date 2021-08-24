const request = require("request");
const fs = require("fs");

const getdatesForContribution = () => {
  const today = new Date();
  const priorDate = new Date();
  priorDate.setDate(priorDate.getDate() - 30);
  return {
    today,
    priorDate,
    todayTimestamp: today.valueOf(),
    priorDateTimestamp: priorDate.valueOf(),
  };
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
    from: `${getdatesForContribution().priorDate}`,
    to: `${getdatesForContribution().today}`,
    raw: {
      from: "now-1m",
      to: "now",
    },
  },
  from: `${getdatesForContribution().priorDateTimestamp}`,
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
  const topContributors = await request.post(
    settings("topContributors"),
    function (error, response, body) {
      if (error) {
        console.error(error);
        return;
      }
      const data = JSON.stringify(body?.results?.A?.frames[0]?.data?.values[1]);
      data && fs.writeFileSync("src/resources/topContributors.json", data);
      return data;
    }
  );

  topContributors &&
    (await request.post(
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
    ));
};

fetchContributors();
