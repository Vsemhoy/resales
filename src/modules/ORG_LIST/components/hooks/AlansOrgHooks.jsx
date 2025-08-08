import { TrophyIcon } from "@heroicons/react/16/solid";
import { BriefcaseIcon, DocumentCurrencyDollarIcon, PhoneArrowUpRightIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "antd";
import dayjs from "dayjs";
import { NavLink } from "react-router-dom";



export const getBidsItems = (bids) => {
    return [
      {
        key: "bids",
        label: "Последние заявки",
        disabled: true,
      },
      {
        type: "divider",
      },
      ...(bids && bids.length > 0
        ? bids.map((bid, index) => {
            const key = bid.key;
            const date = bid.date;
            const type = bid.type;
            const object = bid.object;
            const formattedDate = dayjs(date * 1000).format("DD.MM.YYYY");
            const Label = () => {
              return (
                <Tooltip title={`${object && object !== 'null' && object !== ' ' ? object : ''}`}>
                    <a href={'/bids/' + key} target="_blank" rel="noopener noreferrer">
                    <div
                        style={{ fontSize: "12px" }}
                    >
                        {`${formattedDate} | ${key} |  ${type}`}
                    </div>
                  </a>
                </Tooltip>
              );
            };
            return {
              key,
              label: <Label />,
              icon: (
                <DocumentCurrencyDollarIcon height={'18px'} />
              ),
            };
          })
        : []),
    ];
  };
  const getCallsItems = (calls) => {
    return [
      {
        key: "1",
        label: "Последние звонки",
        disabled: true,
      },
      {
        type: "divider",
      },
      ...(calls && calls.length > 0
        ? calls.map((call, index) => {
            const key = call.find(
              (call_props) => call_props.id === "key",
            ).value;
            const date = call.find(
              (call_props) => call_props.id === "date",
            ).value;
            const creator =
              call.find((call_props) => call_props.id === "creator_name")
                .value || "Нет данных";
            const result =
              call.find((call_props) => call_props.id === "result").value ||
              "Нет данных";
            const subscriber = call.find(
              (call_props) => call_props.id === "subscriber",
            ).value;
            const formattedDate = dayjs(date * 1000).format("DD.MM.YYYY");
            const Label = () => {
              return (
                <Tooltip title={`Результат: ${result}`}>
                  <div style={{ fontSize: "12px" }}>
                    {`${formattedDate} ${creator} ${subscriber}`}
                  </div>
                </Tooltip>
              );
            };
            return {
              key,
              label: <Label />,
              icon: (
                <PhoneArrowUpRightIcon height={'18px'} />
              ),
            };
          })
        : []),
    ];
  };
  const getMeetingsItems = (meetings) => {
    return [
      {
        key: "1",
        label: "Последние встречи",
        disabled: true,
      },
      {
        type: "divider",
      },
      ...(meetings && meetings.length > 0
        ? meetings.map((meeting, index) => {
            const key = meeting.find(
              (meeting_props) => meeting_props.id === "key",
            ).value;
            const date = meeting.find(
              (meeting_props) => meeting_props.id === "date",
            ).value;
            const creator =
              meeting.find(
                (meeting_props) => meeting_props.id === "creator_name",
              ).value || "Нет данных";
            const result =
              meeting.find((meeting_props) => meeting_props.id === "result")
                .value || "Нет данных";
            const subscriber = meeting.find(
              (meeting_props) => meeting_props.id === "subscriber",
            ).value;
            const formattedDate = dayjs(date * 1000).format("DD.MM.YYYY");
            const Label = () => {
              return (
                <Tooltip title={`Результат: ${result}`}>
                  <div style={{ fontSize: "12px" }}>
                    {`${formattedDate} ${creator} ${subscriber}`}
                  </div>
                </Tooltip>
              );
            };
            return {
              key,
              label: <Label />,
              icon: (
                <BriefcaseIcon height={'18px'} />
              ),
            };
          })
        : []),
    ];
  };
  const getLicensesItems = (licenses) => {
    const licenses__items = [];

    if (licenses.licenses.length > 0) {
      licenses__items.push(
        {
          key: "1",
          label: "Лицензии",
          disabled: true,
        },
        {
          type: "divider",
        },
        ...(licenses.licenses && licenses.licenses.length > 0
          ? licenses.licenses.map((license, index) => {
              const key = index;
              const start_date = license.start_date;
              const end_date = license.end_date;
              const comment = license.comment;
              const name = license.name;

              const formattedStartDate = dayjs(start_date * 1000).format(
                "DD.MM.YYYY",
              );
              const formattedEndDate = dayjs(end_date * 1000).format(
                "DD.MM.YYYY",
              );
              const Label = () => {
                return (
                  <Tooltip
                    title={`Действие: ${formattedStartDate}-${formattedEndDate}`}
                  >
                    <div style={{ fontSize: "12px" }}>
                      {`${name}: ${comment}`}
                    </div>
                  </Tooltip>
                );
              };
              return {
                key,
                label: <Label />,
                icon: (
                  <ShieldCheckIcon height={'18px'} />
                ),
              };
            })
          : []),
      );
    }
    if (licenses.tolerance.length > 0) {
      licenses__items.push(
        {
          key: "2",
          label: "Допуски",
          disabled: true,
        },
        {
          type: "divider",
        },
        ...(licenses.tolerance && licenses.tolerance.length > 0
          ? licenses.tolerance.map((tolerance, index) => {
              const key = index;
              const start_date = tolerance.start_date;
              const end_date = tolerance.end_date;
              const comment = tolerance.comment;
              const name = tolerance.name;

              const formattedStartDate = dayjs(start_date * 1000).format(
                "DD.MM.YYYY",
              );
              const formattedEndDate = dayjs(end_date * 1000).format(
                "DD.MM.YYYY",
              );
              const Label = () => {
                return (
                  <Tooltip
                    title={`Действие: ${formattedStartDate}-${formattedEndDate}`}
                  >
                    <div style={{ fontSize: "12px" }}>
                      {`${name}: ${comment}`}
                    </div>
                  </Tooltip>
                );
              };
              return {
                key,
                label: <Label />,
                icon: (
                  <TrophyIcon height={'18px'} />
                ),
              };
            })
          : []),
      );
    }
    return licenses__items;
  };