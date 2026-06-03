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

const API_URL = "https://openebs.devstats.cncf.io/api/ds/query";
const API_HEADERS = { "Content-Type": "application/json" };

const postContributorsQuery = async (body) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = new Error(`Request to ${API_URL} failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

const fetchContributors = async () => {
  try {
    const topRes = await postContributorsQuery(reqBodyToFetchContributors("topContributors"));
    const topData = JSON.stringify(topRes?.results?.A?.frames[0]?.data?.values[1]);
    topData && fs.writeFileSync("../website/src/resources/topContributors.json", topData);
    topData && fs.writeFileSync("../docs/src/data/topContributors.json", topData);
  } catch (error) {
    console.error("Error fetching topContributors:", error.status, error.message);
  }

  try {
    const newRes = await postContributorsQuery(reqBodyToFetchContributors("newContributors"));
    const newData = JSON.stringify(newRes?.results?.A?.frames[0]?.data?.values[0]?.reverse());
    newData && fs.writeFileSync("../website/src/resources/newContributors.json", newData);
    newData && fs.writeFileSync("../docs/src/data/newContributors.json", newData);
  } catch (error) {
    console.error("Error fetching newContributors:", error.status, error.message);
  }
};

fetchContributors();
