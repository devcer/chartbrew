import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Segment, Form, Button, Icon, Header, Label, Divider, Message, Checkbox, Popup,
  Placeholder, Container, List,
} from "semantic-ui-react";
import uuid from "uuid/v4";
import AceEditor from "react-ace";

import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/theme-tomorrow";

/*
  The MongoDB connection form
*/
function MongoConnectionForm(props) {
  const {
    editConnection, projectId, onComplete, addError, testResult, onTest,
  } = props;

  const [showIp, setShowIp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [connection, setConnection] = useState({ type: "mongodb", optionsArray: [], srv: false });
  const [errors, setErrors] = useState({});
  const [formStyle, setFormStyle] = useState("string");

  useEffect(() => {
    _init();
  }, []);

  const _init = () => {
    if (editConnection) {
      const newConnection = editConnection;
      // format the options
      if (newConnection.options && newConnection.options.length > 0) {
        const newOptions = [];
        const formattedOptions = newConnection.options.split("&");
        for (let i = 0; i < formattedOptions.length; i++) {
          let optionKey = formattedOptions[i].substring(0, formattedOptions[i].indexOf("="));
          optionKey = optionKey.replace("?", "");

          const optionValue = formattedOptions[i].substring(formattedOptions[i].indexOf("=") + 1);
          newOptions.push({
            id: uuid(),
            key: optionKey,
            value: optionValue,
          });
        }

        if (newOptions) {
          newConnection.optionsArray = newOptions;
        } else {
          newConnection.optionsArray = [];
        }
      } else {
        newConnection.optionsArray = [];
      }

      setConnection(newConnection);
    }
  };

  const _onCreateConnection = (test = false) => {
    setErrors({});

    if (formStyle === "form") {
      if (!connection.name || connection.name.length > 24) {
        setTimeout(() => {
          setErrors({ ...errors, name: "Please enter a name which is less than 24 characters" });
        }, 100);
        return;
      }
      if (!connection.host) {
        setTimeout(() => {
          setErrors({ ...errors, host: "Please enter a host name or IP address for your database" });
        }, 100);
        return;
      }
      if (!connection.dbName) {
        setTimeout(() => {
          setErrors({ ...errors, dbName: "Please enter your database name" });
        }, 100);
        return;
      }
    }

    if (formStyle === "string") {
      if (!connection.name || connection.name.length > 24) {
        setTimeout(() => {
          setErrors({ ...errors, name: "Please enter a name which is less than 24 characters" });
        }, 100);
        return;
      }

      if (!connection.connectionString) {
        setTimeout(() => {
          setErrors({ ...errors, connectionString: "Please enter a connection string first" });
        }, 100);
        return;
      }
    }

    const newConnection = connection;

    // Clean the connection string if the form style is Form
    if (formStyle === "form") {
      newConnection.connectionString = "";
    }

    // prepare the options
    const tempOptions = newConnection.optionsArray;
    const newOptions = [];
    if (newConnection.optionsArray.length > 0) {
      for (let i = 0; i < tempOptions.length; i++) {
        if (tempOptions[i].key && tempOptions[i].value) {
          newOptions.push({ [tempOptions[i].key]: tempOptions[i].value });
        }
      }
    }

    newConnection.options = newOptions;
    newConnection.project_id = projectId;

    setTimeout(() => {
      if (test === true) {
        setTestLoading(true);
        onTest(newConnection)
          .then(() => setTestLoading(false))
          .catch(() => setTestLoading(false));
      } else {
        setLoading(true);
        onComplete(newConnection);
      }
    }, 100);
  };

  const _onChangeSrv = () => {
    if (!connection.srv) {
      setConnection({ ...connection, srv: true });
    } else {
      setConnection({ ...connection, srv: false });
    }
  };

  const _addOption = () => {
    const option = {
      id: uuid(),
      key: "",
      value: "",
    };
    setConnection({
      ...connection, optionsArray: [...connection.optionsArray, option]
    });
  };

  const _removeOption = (id) => {
    const tempOptions = connection.optionsArray;
    const newOptions = [];
    for (let i = 0; i < tempOptions.length; i++) {
      if (tempOptions[i].id !== id) {
        newOptions.push(tempOptions[i]);
      }
    }

    setConnection({ ...connection, optionsArray: newOptions });
  };

  const _onChangeOption = (id, value, selector) => {
    const tempOptions = connection.optionsArray;

    for (let i = 0; i < tempOptions.length; i++) {
      if (tempOptions[i].id === id) {
        if (tempOptions[i][selector]) tempOptions[i][selector] = "";
        tempOptions[i][selector] = value;
      }
    }

    setConnection({ ...connection, optionsArray: tempOptions });
  };

  return (
    <div style={styles.container}>
      <Header attached="top" as="h3">Connect to a MongoDB database</Header>
      <Segment attached>
        <Container textAlign="center">
          <Button.Group>
            <Button
              basic
              color={formStyle === "string" ? "blue" : null}
              onClick={() => setFormStyle("string")}
            >
              Connection string
            </Button>
            <Button
              basic
              color={formStyle === "form" ? "blue" : null}
              onClick={() => setFormStyle("form")}
            >
              Connection form
            </Button>
          </Button.Group>
        </Container>

        {formStyle === "string" && (
          <div style={styles.formStyle}>
            <Form>
              <Form.Field>
                <label>Name your connection</label>
                <Form.Input
                  placeholder="Enter a name that you can recognise later"
                  value={connection.name || ""}
                  onChange={(e, data) => {
                    setConnection({ ...connection, name: data.value });
                  }}
                />
                {errors.name
                  && (
                    <Label basic color="red" pointing>
                      {errors.name}
                    </Label>
                  )}
              </Form.Field>
              <Form.Field>
                <label>Enter your MongoDB connection string</label>
                <Form.Input
                  placeholder="mongodb://username:password@mongodb.example.com:27017/dbname"
                  value={connection.connectionString || ""}
                  onChange={(e, data) => {
                    setConnection({ ...connection, connectionString: data.value });
                  }}
                />
                {errors.connectionString && (
                  <Label basic color="red" pointing>
                    {errors.connectionString}
                  </Label>
                )}
              </Form.Field>
            </Form>
          </div>
        )}

        {formStyle === "form" && (
          <div style={styles.formStyle}>
            <Form>
              <Form.Field error={!!errors.name} required>
                <label>Name your connection</label>
                <Form.Input
                  placeholder="Enter a name that you can recognise later"
                  value={connection.name || ""}
                  onChange={(e, data) => {
                    setConnection({ ...connection, name: data.value });
                  }}
                />
                {errors.name
                  && (
                  <Label basic color="red" pointing>
                    {errors.name}
                  </Label>
                  )}
              </Form.Field>

              <Form.Group widths={2}>
                <Form.Field error={!!errors.host} required width={10}>
                  <label>Hostname or IP address</label>
                  <Form.Input
                    placeholder="'yourmongodomain.com' or '0.0.0.0' "
                    value={connection.host || ""}
                    onChange={(e, data) => {
                      setConnection({ ...connection, host: data.value });
                    }}
                  />
                  {errors.host && (
                    <Label basic color="red" pointing>
                      {errors.host}
                    </Label>
                  )}
                </Form.Field>
                <Form.Field error={!!errors.port} width={6}>
                  <label>Port</label>
                  <Form.Input
                    placeholder="Leave empty if using the default"
                    value={connection.port || ""}
                    onChange={(e, data) => {
                      setConnection({ ...connection, port: data.value });
                    }}
                  />
                  {errors.port && (
                    <Label basic color="red" pointing>
                      {errors.port}
                    </Label>
                  )}
                </Form.Field>
              </Form.Group>

              <Form.Group widths={3}>
                <Form.Field error={!!errors.dbName} required width={6}>
                  <label>Database name</label>
                  <Form.Input
                    placeholder="Enter your database name"
                    value={connection.dbName || ""}
                    onChange={(e, data) => {
                      setConnection({ ...connection, dbName: data.value });
                    }}
                  />
                  {errors.dbName && (
                    <Label basic color="red" pointing>
                      {errors.dbName}
                    </Label>
                  )}
                </Form.Field>

                <Form.Field error={!!errors.username} width={5}>
                  <label>Database username</label>
                  <Form.Input
                    placeholder="Username"
                    value={connection.username || ""}
                    onChange={(e, data) => {
                      setConnection({ ...connection, username: data.value });
                    }}
                  />
                  {errors.username && (
                    <Label basic color="red" pointing>
                      {errors.username}
                    </Label>
                  )}
                </Form.Field>

                <Form.Field error={!!errors.password} width={5}>
                  {!editConnection && <label>Database password</label>}
                  {editConnection && <label>New database password</label>}
                  <Form.Input
                    placeholder="Database user password"
                    type="password"
                    onChange={(e, data) => {
                      setConnection({ ...connection, password: data.value });
                    }}
                  />
                  {errors.password && (
                    <Label basic color="red" pointing>
                      {errors.password}
                    </Label>
                  )}
                </Form.Field>
              </Form.Group>

              <Form.Field>
                <Checkbox
                  label="Use MongoDB 3.6 SRV URI connection string "
                  defaultChecked={connection.srv}
                  onChange={_onChangeSrv}
                />
                <Popup
                  trigger={<Icon name="question circle outline" />}
                  content="Tick this if your connection URI contains 'mongodb+srv://'"
                />
              </Form.Field>

              <Message info>
                <Message.Header>Avoid using users that can write data</Message.Header>
                <p>{"Out of abundance of caution, we recommend all our users to connect only with read permissions. Don't use mongo users with readWrite permissions."}</p>
                <a href="https://docs.mongodb.com/manual/reference/method/db.createUser/" target="_blank" rel="noopener noreferrer">
                  Check this link on how to do it
                </a>
              </Message>

              <Divider />
              {connection.optionsArray.length > 0
                && <Header as="h5">Connection options</Header>}
              {connection.optionsArray.map((option) => {
                return (
                  <Form.Group widths="equal" key={option.id}>
                    <Form.Input
                      placeholder="Key"
                      onChange={(e, data) => _onChangeOption(option.id, data.value, "key")}
                    />
                    <Form.Input
                      onChange={(e, data) => _onChangeOption(option.id, data.value, "value")}
                      placeholder="Value"
                    />
                    <Form.Button icon onClick={() => _removeOption(option.id)}>
                      <Icon name="close" />
                    </Form.Button>
                  </Form.Group>
                );
              })}
              <Form.Field>
                <Button
                  size="small"
                  icon
                  labelPosition="right"
                  onClick={_addOption}
                >
                  <Icon name="plus" />
                  Add options
                </Button>
              </Form.Field>
            </Form>
          </div>
        )}

        <List style={styles.helpList} relaxed animated>
          <List.Item
            icon="chevron right"
            content="Find out more about MongoDB connection strings"
            as="a"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.mongodb.com/manual/reference/connection-string/"
          />
          <List.Item
            icon="chevron right"
            content="Find out how to get your MongoDB Atlas connection string"
            as="a"
            href="https://docs.mongodb.com/guides/cloud/connectionstring/"
            target="_blank"
            rel="noopener noreferrer"
          />
        </List>

        {showIp && (
          <Message onDismiss={() => setShowIp(false)}>
            <Message.Header>{"Whitelist the IP of the server the app is running from"}</Message.Header>
            <p>{"This is sometimes required when the database and the Chartbrew app are running on separate servers."}</p>
          </Message>
        )}
        {addError && (
          <Message negative>
            <Message.Header>{"Server error while trying to save your connection"}</Message.Header>
            <p>Please try adding your connection again.</p>
          </Message>
        )}
      </Segment>
      <Button.Group attached="bottom">
        <Button
          primary
          basic
          onClick={() => _onCreateConnection(true)}
          loading={testLoading}
        >
          Test connection
        </Button>
        {!editConnection
          && (
          <Button
            primary
            attached="bottom"
            loading={loading}
            onClick={_onCreateConnection}
          >
            Save connection
          </Button>
          )}
        {editConnection
          && (
          <Button
            secondary
            attached="bottom"
            loading={loading}
            onClick={_onCreateConnection}
          >
            Save changes
          </Button>
          )}
      </Button.Group>
      {testLoading && (
        <Segment>
          <Placeholder>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder>
        </Segment>
      )}

      {testResult && !testLoading && (
        <Container fluid style={{ marginTop: 15 }}>
          <Header attached="top">
            Test Result
            <Label
              color={testResult.status < 400 ? "green" : "orange"}
            >
              {testResult.status < 400 ? "Your connection works!" : "We couldn't connect"}
            </Label>
          </Header>
          <Segment attached>
            <AceEditor
              mode="json"
              theme="tomorrow"
              height="150px"
              width="none"
              value={testResult.body}
              readOnly
              name="queryEditor"
              editorProps={{ $blockScrolling: true }}
            />
          </Segment>
        </Container>
      )}
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  formStyle: {
    marginTop: 20,
    padding: 10,
    marginBottom: 20,
  },
  helpList: {
    marginBottom: 20,
    paddingRight: 10,
    paddingLeft: 10,
    display: "inline-block",
  },
};

MongoConnectionForm.defaultProps = {
  onComplete: () => {},
  onTest: () => {},
  editConnection: null,
  addError: false,
  testResult: null,
};

MongoConnectionForm.propTypes = {
  onComplete: PropTypes.func,
  onTest: PropTypes.func,
  projectId: PropTypes.string.isRequired,
  editConnection: PropTypes.object,
  addError: PropTypes.bool,
  testResult: PropTypes.object,
};

export default MongoConnectionForm;
