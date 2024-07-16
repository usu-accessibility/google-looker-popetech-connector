const cc = DataStudioApp.createCommunityConnector();

let BASE_URL = "https://api.pope.tech/organizations/";
let POPETECH_API_KEY = "";

function getAuthType() {
  return cc.newAuthTypeResponse().setAuthType(cc.AuthType.NONE).build();
}

function isAdminUser() {
  return false;
}

function getConfig(request) {
  const config = cc.getConfig();

  config
    .newTextInput()
    .setId("slug")
    .setName("Enter Popetech organization slug.")
    .setHelpText('e.g. "usu"');

  config
    .newTextInput()
    .setId("apiKey")
    .setName("Enter Popetech API key.")
    .setHelpText('e.g. "eysjcnew12dmwd..."');

  return config.build();
}

function getFields() {
  const fields = cc.getFields();
  const types = cc.FieldType;
  const aggregations = cc.AggregationType;

  fields.newDimension().setId("url").setName("Url").setType(types.TEXT);

  fields
    .newDimension()
    .setId("publicId")
    .setName("Public Id")
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId("very_low_contrast")
    .setName("Contrast")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("missing_alternative_text")
    .setName("Missing Alt Text")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("empty_link")
    .setName("Empty Link")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("missing_form_label")
    .setName("Missing Form Label")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("linked_image_missing_alternative_text")
    .setName("Linked Image Missing Alt Text")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("empty_button")
    .setName("Empty Button")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("broken_aria_reference")
    .setName("Broken ARIA Reference")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("language_missing_or_invalid")
    .setName("Langauge Missing or Invalid")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("empty_form_label")
    .setName("Empty Form Label")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("broken_aria_menu")
    .setName("Broken ARIA Menu")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("empty_heading")
    .setName("Empty Heading")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("multiple_form_labels")
    .setName("Multiple Form Labels")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("spacer_image_missing_alternative_text")
    .setName("Spacer Image Missing Alt Text")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("empty_table_header")
    .setName("Empty Table Header")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("broken_skip_link")
    .setName("Broken Skip Link")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("missing_or_uninformative_page_title")
    .setName("Missing or Uninformative Page Title")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("image_map_missing_alternative_text")
    .setName("Image Map Missing Alt Text")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("image_button_missing_alternative_text")
    .setName("Image Button Missing Alt Text")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("image_map_area_missing_alternative_text")
    .setName("Image Map Area Missing Alt Text")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("page_refreshes_or_redirects")
    .setName("Page Refreshes or Redirects")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("blinking_content")
    .setName("Blinking Content")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("invalid_longdesc")
    .setName("Invalid Longdesc")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields
    .newMetric()
    .setId("marquee")
    .setName("Marquee")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  return fields;
}

function getSchema(request) {
  return { schema: getFields().build() };
}

function getData(request) {
  const requestedFields = getFields().forIds(
    request.fields.map(function (field) {
      return field.name;
    }),
  );

  const data = getPopetechErrors(request, requestedFields);

  return {
    schema: requestedFields.build(),
    rows: data,
    filtersApplied: true,
  };
}

function getPopetechErrors(request, requestedFields) {
  BASE_URL = BASE_URL + request.configParams.slug;
  POPETECH_API_KEY = request.configParams.apiKey;

  const websites = getPopetechWebsites();

  const totals = [];
  for (const site of websites) {
    const details = fetcher(
      BASE_URL + "/reports/result-details?website_filter=" + site.publicId,
    );

    const errors = details?.errors || [];
    const contrast = details?.contrast?.[0]?.count || 0;

    const row = requestedFields.asArray().map((field) => {
      switch (field.getId()) {
        case "url":
          return site.url;
        case "publicId":
          return site.publicId;
        case "very_low_contrast":
          return contrast;
        default:
          const found = errors.find((err) => err.slug === field.getId());

          if (found) {
            return found.count;
          } else {
            return 0;
          }
      }
    });

    totals.push({
      values: row,
    });
  }

  return totals;
}

function getPopetechWebsites() {
  const websites = [];
  let url = BASE_URL + "/websites?limit=25";

  // while (url) {
  //   const sites = fetcher(url);

  //   for (const site of sites.data) {
  //     websites.push({
  //       publicId: site.public_id,
  //       url: site.full_url
  //     })
  //   }

  //   if (sites.meta.pagination.links.next) {
  //     url = sites.meta.pagination.links.next + "&limit=250"
  //   } else {
  //     url = null
  //   }
  // }

  const sites = fetcher(url);

  for (const site of sites.data) {
    websites.push({
      publicId: site.public_id,
      url: site.full_url,
    });
  }

  return websites;
}

function fetcher(url) {
  let retryCounts = {};
  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: "Bearer " + POPETECH_API_KEY,
      },
    });

    return JSON.parse(response.getContentText());
  } catch {
    if (retryCounts[url]) {
      if (retryCounts[url] < 10) {
        retryCounts[url] = retryCounts[url] + 1;

        console.log("Limiting on url: " + url);
        Utilities.sleep(20000);
        return fetcher(url);
      } else {
        throw new Error("Max retry count hit on url: " + url);
      }
    } else {
      retryCounts[url] = 1;

      console.log("Limiting on url: " + url);
      Utilities.sleep(20000);
      return fetcher(url);
    }
  }
}
