import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "antd/dist/reset.css";
import "./index.css";
import { Table } from "antd";
import reqwest from "reqwest";
import { useVT } from "virtualizedtableforantd4";
import { v4 as uuidv4 } from "uuid";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    render: (name) => `${name.first} ${name.last}`
  }
];

const getRandomuserParams = (params) => ({
  results: params.pagination.pageSize,
  page: params.pagination.current,
  ...params
});

const App = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30
  });
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(
    (params = {}) => {
      console.log("params", params);
      setLoading(true);
      reqwest({
        url: "https://randomuser.me/api",
        method: "get",
        type: "json",
        data: getRandomuserParams(params)
      }).then((newData) => {
        const _data = [];
        newData.results.forEach((item, index) => {
          _data.push({ ...item, key: `${uuidv4()}` });
        });
        setLoading(false);
        setData([...data, ...(_data ?? [])]);
        setPagination({ ...params.pagination, total: 200 });
      });
    },
    [setData, data]
  );

  useEffect(() => {
    if (!data.length) {
      fetch({ pagination });
    }
  }, [data, fetch, pagination]);

  const [vt] = useVT(
    () => ({
      onScroll: ({ left, top, isEnd }) => {
        console.log("TRY:", left, top, isEnd);
        if (isEnd) {
          console.log("TRY END");
          if (data && data.length < 200) {
            fetch({
              pagination: { current: pagination.current + 1, pageSize: 10 }
            });
          }
        }
      },
      scroll: {
        y: 250
      },
      debug: false
    }),
    [data]
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      components={vt}
      pagination={false}
      loading={loading}
      scroll={{
        scrollToFirstRowOnChange: false,
        y: 300
      }}
    />
  );
};

ReactDOM.render(<App />, document.getElementById("container"));
