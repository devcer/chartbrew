import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import {
  Card, Image, Button, Icon, Container, Divider,
  Modal, Header, Message, Segment, TransitionablePortal, Menu, Label,
} from "semantic-ui-react";
import { useWindowSize } from "react-use";

import MongoConnectionForm from "./components/MongoConnectionForm";
import ApiConnectionForm from "./components/ApiConnectionForm";
import PostgresConnectionForm from "./components/PostgresConnectionForm";
import MysqlConnectionForm from "./components/MysqlConnectionForm";
import FirebaseConnectionForm from "./Firebase/FirebaseConnectionForm";
import FirestoreConnectionForm from "./Firestore/FirestoreConnectionForm";
import GaConnectionForm from "./GoogleAnalytics/GaConnectionForm";
import SimpleAnalyticsTemplate from "./SimpleAnalytics/SimpleAnalyticsTemplate";
import ChartMogulTemplate from "./ChartMogul/ChartMogulTemplate";
import MailgunTemplate from "./Mailgun/MailgunTemplate";
import GaTemplate from "./GoogleAnalytics/GaTemplate";
import CustomTemplates from "./CustomTemplates/CustomTemplates";

import {
  testRequest as testRequestAction,
  removeConnection as removeConnectionAction,
  getProjectConnections as getProjectConnectionsAction,
  addConnection as addConnectionAction,
  saveConnection as saveConnectionAction,
} from "../../actions/connection";
import {
  getTemplates as getTemplatesAction
} from "../../actions/template";
import { cleanErrors as cleanErrorsAction } from "../../actions/error";
import { getProjectCharts as getProjectChartsAction } from "../../actions/chart";
import canAccess from "../../config/canAccess";
import simpleAnalyticsLogo from "../../assets/simpleAnalytics.png";
import moreLogo from "../../assets/moreComingSoon.png";
import chartmogulLogo from "../../assets/ChartMogul.webp";
import mailgunLogo from "../../assets/mailgun_logo.webp";
import { lightGray, primary } from "../../config/colors";
import connectionImages from "../../config/connectionImages";

/*
  The page that contains all the connections
*/
function Connections(props) {
  const {
    cleanErrors, addConnection, saveConnection, match, history, connections, testRequest,
    removeConnection, getProjectConnections, user, team, getProjectCharts, getTemplates,
    templates,
  } = props;

  const { width } = useWindowSize();

  const [newConnectionModal, setNewConnectionModal] = useState(false);
  const [addError, setAddError] = useState(false);
  const [formType, setFormType] = useState("");
  const [editConnection, setEditConnection] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [removeModal, setRemoveModal] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("connections");
  const [templateConnection, setTemplateConnection] = useState(-1);

  useEffect(() => {
    cleanErrors();
    getTemplates(match.params.teamId);
  }, []);

  useEffect(() => {
    if (connections && connections.length > 0 && !selectedConnection && !editConnection) {
      const params = new URLSearchParams(document.location.search);
      if (params.has("edit") && params.has("type")) {
        setTemplateConnection(parseInt(params.get("edit"), 10));
        setFormType(params.get("type"));
      } else if (params.has("edit")) {
        const foundConnection = connections.filter((c) => `${c.id}` === params.get("edit"))[0];
        if (foundConnection) {
          setEditConnection(foundConnection);
          setFormType(foundConnection.type);
        }
      }
    }
  }, [connections]);

  useEffect(() => {
    setTestResult(null);
  }, [selectedConnection, editConnection]);

  const _onOpenConnectionForm = () => {
    setNewConnectionModal(true);
    setTestResult(null);
  };

  const _onAddNewConnection = (connection, switchToEdit) => {
    let redirect = false;
    if (connections.length === 0 && !switchToEdit) {
      redirect = true;
    }

    if (!connection.id) {
      return addConnection(match.params.projectId, connection)
        .then((newConnection) => {
          if (redirect) {
            history.push(`/${match.params.teamId}/${match.params.projectId}/chart`);
          }

          if (!switchToEdit) {
            setFormType(null);
            setEditConnection(null);
          } else {
            _onEditConnection(newConnection);
          }

          setNewConnectionModal(false);
          return true;
        })
        .catch((error) => {
          setAddError(error);
          return false;
        });
    } else {
      return saveConnection(match.params.projectId, connection)
        .then(() => {
          setFormType(null);
          setEditConnection(null);
          return true;
        })
        .catch((error) => {
          setAddError(error);
          return false;
        });
    }
  };

  const _onTestRequest = (data) => {
    const newTestResult = {};
    return testRequest(match.params.projectId, data)
      .then(async (response) => {
        newTestResult.status = response.status;
        newTestResult.body = await response.text();

        try {
          newTestResult.body = JSON.parse(newTestResult.body);
          newTestResult.body = JSON.stringify(newTestResult, null, 2);
        } catch (e) {
          // the response is not in JSON format
        }

        setTestResult(newTestResult);
        return Promise.resolve(newTestResult);
      })
      .catch(() => {});
  };

  const _onRemoveConfirmation = (connection) => {
    setSelectedConnection(connection);
    setRemoveModal(true);
  };

  const _onRemoveConnection = () => {
    setRemoveLoading(selectedConnection.id);
    setRemoveError(false);

    removeConnection(match.params.projectId, selectedConnection.id)
      .then(() => {
        return getProjectConnections(match.params.projectId);
      })
      .then(() => {
        setRemoveLoading(false);
        setSelectedConnection(false);
        setRemoveModal(false);
      })
      .catch(() => {
        setRemoveError(true);
        setRemoveModal(true);
        setSelectedConnection(false);
      });
  };

  const _onEditConnection = (connection) => {
    setEditConnection(null);
    setFormType("");
    setTimeout(() => {
      setEditConnection(connection);
      setFormType(connection.type);
    }, 100);
  };

  const _closeConnectionForm = () => {
    setNewConnectionModal(true);
    setFormType(null);
    setEditConnection(null);
  };

  const _onCompleteTemplate = () => {
    getProjectCharts(match.params.projectId)
      .then(() => {
        history.push(`/${match.params.teamId}/${match.params.projectId}/dashboard`);
        window.location.reload();
      });
  };

  const _canAccess = (role) => {
    return canAccess(role, user.id, team.TeamRoles);
  };

  return (
    <div style={styles.container}>
      <Container style={styles.mainContent}>
        {formType && (
          <Container>
            {removeError && (
              <Message negative>
                <Message.Header>Oups! A server error intrerruped the request</Message.Header>
                <p>Please refresh the page and try again.</p>
              </Message>
            )}

            {formType && (
              <Button secondary icon labelPosition="left" onClick={_closeConnectionForm}>
                <Icon name="chevron left" />
                Back
              </Button>
            )}

            <Divider />
          </Container>
        )}

        {connections.length > 0 && !formType && (
          <Container>
            <Button primary icon labelPosition="right" onClick={_onOpenConnectionForm}>
              <Icon name="plus" />
              Add a new connection
            </Button>
            <Divider />
          </Container>
        )}

        {(connections.length < 1 || newConnectionModal) && !formType
          && (
          <div>
            <Divider hidden />
            {connections.length < 1 && (
              <div style={{ textAlign: "center" }}>
                <Header as="h1" textAlign="left">
                  {"Create a connection or start with a template"}
                </Header>
                <Divider hidden />
              </div>
            )}
            {connections.length > 0 && (
              <Header as="h2" textAlign="left">
                Select one of the connection types below
              </Header>
            )}
            <Menu
              size="big"
              tabular={width >= 768 ? true : null}
              stackable
              attached={width >= 768 ? "top" : null}
              secondary={width < 768 ? true : null}
            >
              <Menu.Item
                active={selectedMenu === "connections"}
                name="Connections"
                onClick={() => setSelectedMenu("connections")}
                icon="plug"
              />
              <Menu.Item
                active={selectedMenu === "templates"}
                onClick={() => setSelectedMenu("templates")}
              >
                <Icon name="magic" />
                Community templates
              </Menu.Item>
              <Menu.Item
                active={selectedMenu === "customTemplates"}
                onClick={() => setSelectedMenu("customTemplates")}
              >
                <Icon name="clone" />
                Custom templates
                <Label color="olive">New!</Label>
              </Menu.Item>
            </Menu>
            <Segment attached>
              {selectedMenu === "connections" && (
                <Card.Group itemsPerRow={5} stackable>
                  <Card className="project-segment" onClick={() => setFormType("api")}>
                    <Image src={connectionImages.api} />
                    <Card.Content textAlign="center">
                      <Card.Header>API</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("mongodb")}>
                    <Image src={connectionImages.mongodb} />
                    <Card.Content textAlign="center">
                      <Card.Header>MongoDB</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("postgres")}>
                    <Image src={connectionImages.postgres} />
                    <Card.Content textAlign="center">
                      <Card.Header>PostgreSQL</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("mysql")}>
                    <Image src={connectionImages.mysql} />
                    <Card.Content textAlign="center">
                      <Card.Header>MySQL</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("firestore")}>
                    <Image
                      src={connectionImages.firestore}
                      label={{
                        as: "a", color: "olive", title: "Freshly released", corner: "left", icon: "wrench"
                      }}
                    />
                    <Card.Content textAlign="center">
                      <Card.Header>Firestore</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("googleAnalytics")}>
                    <Image
                      src={connectionImages.googleAnalytics}
                      label={{
                        as: "a", color: "olive", title: "Freshly released", corner: "left", icon: "wrench"
                      }}
                    />
                    <Card.Content textAlign="center">
                      <Card.Header>Google Analytics</Card.Header>
                    </Card.Content>
                  </Card>
                </Card.Group>
              )}
              {selectedMenu === "templates" && (
                <Card.Group itemsPerRow={5} stackable>
                  <Card className="project-segment" onClick={() => setFormType("saTemplate")}>
                    <Image src={simpleAnalyticsLogo} />
                    <Card.Content textAlign="center">
                      <Card.Header>Simple Analytics</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("cmTemplate")}>
                    <Image src={chartmogulLogo} />
                    <Card.Content textAlign="center">
                      <Card.Header>ChartMogul</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("mailgunTemplate")}>
                    <Image src={mailgunLogo} />
                    <Card.Content textAlign="center">
                      <Card.Header>Mailgun</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card className="project-segment" onClick={() => setFormType("googleAnalyticsTemplate")}>
                    <Image src={connectionImages.googleAnalytics} />
                    <Card.Content textAlign="center">
                      <Card.Header>Google Analytics</Card.Header>
                    </Card.Content>
                  </Card>
                  <Card>
                    <Image src={moreLogo} />
                    <Card.Content textAlign="center">
                      <Card.Header>More coming soon</Card.Header>
                    </Card.Content>
                  </Card>
                </Card.Group>
              )}

              {selectedMenu === "customTemplates" && (
                <CustomTemplates
                  templates={templates.data}
                  loading={templates.loading}
                  teamId={match.params.teamId}
                  projectId={match.params.projectId}
                  connections={connections}
                  onComplete={_onCompleteTemplate}
                  isAdmin={_canAccess("admin")}
                />
              )}
            </Segment>
            <Segment attached="bottom">
              <p>
                {"Need access to another data source? "}
                <a href="https://github.com/chartbrew/chartbrew/issues" target="_blank" rel="noopener noreferrer">
                  {"Let us know 💬"}
                </a>
              </p>
            </Segment>
          </div>
          )}

        <div id="connection-form-area">
          {formType === "api" && (
            <ApiConnectionForm
              projectId={match.params.projectId}
              onTest={_onTestRequest}
              onComplete={_onAddNewConnection}
              editConnection={editConnection}
              addError={addError}
              testResult={testResult}
            />
          )}
          {formType === "mongodb" && (
            <MongoConnectionForm
              projectId={match.params.projectId}
              onTest={_onTestRequest}
              onComplete={_onAddNewConnection}
              editConnection={editConnection}
              addError={addError}
              testResult={testResult}
            />
          )}
          {formType === "postgres" && (
            <PostgresConnectionForm
              projectId={match.params.projectId}
              onTest={_onTestRequest}
              onComplete={_onAddNewConnection}
              editConnection={editConnection}
              addError={addError}
              testResult={testResult}
            />
          )}
          {formType === "mysql" && (
            <MysqlConnectionForm
              projectId={match.params.projectId}
              onTest={_onTestRequest}
              onComplete={_onAddNewConnection}
              editConnection={editConnection}
              addError={addError}
              testResult={testResult}
            />
          )}
          {formType === "firebase" && (
            <FirebaseConnectionForm
              projectId={match.params.projectId}
              onTest={_onTestRequest}
              onComplete={_onAddNewConnection}
              editConnection={editConnection}
              addError={addError}
              testResult={testResult}
            />
          )}
          {formType === "firestore" && (
            <FirestoreConnectionForm
              projectId={match.params.projectId}
              onTest={_onTestRequest}
              onComplete={_onAddNewConnection}
              editConnection={editConnection}
              addError={addError}
              testResult={testResult}
            />
          )}
          {formType === "googleAnalytics" && (
            <GaConnectionForm
              projectId={match.params.projectId}
              onTest={_onTestRequest}
              onComplete={_onAddNewConnection}
              editConnection={editConnection}
              addError={addError}
              testResult={testResult}
            />
          )}

          {/* ADD TEMPLATES BELOW */}
          {formType === "saTemplate" && (
            <SimpleAnalyticsTemplate
              teamId={match.params.teamId}
              projectId={match.params.projectId}
              onComplete={_onCompleteTemplate}
              addError={addError}
              connections={connections}
            />
          )}
          {formType === "cmTemplate" && (
            <ChartMogulTemplate
              teamId={match.params.teamId}
              projectId={match.params.projectId}
              onComplete={_onCompleteTemplate}
              addError={addError}
              connections={connections}
            />
          )}
          {formType === "mailgunTemplate" && (
            <MailgunTemplate
              teamId={match.params.teamId}
              projectId={match.params.projectId}
              onComplete={_onCompleteTemplate}
              addError={addError}
              connections={connections}
            />
          )}
          {formType === "googleAnalyticsTemplate" && (
            <GaTemplate
              teamId={match.params.teamId}
              projectId={match.params.projectId}
              onComplete={_onCompleteTemplate}
              addError={addError}
              connections={connections}
              selection={templateConnection}
            />
          )}
        </div>

        {connections.length > 0
          && (
          <Header as="h2">
            {"Your connections"}
          </Header>
          )}
        <Card.Group itemsPerRow={3} stackable>
          {connections.map(connection => {
            return (
              <Card
                key={connection.id}
                fluid
                className="project-segment"
                style={
                  editConnection && connection.id === editConnection.id
                    ? styles.selectedConnection : {}
                }
              >
                <Card.Content onClick={() => _onEditConnection(connection)} style={{ cursor: "pointer" }}>
                  <Image
                    floated="right"
                    size="tiny"
                    src={connectionImages[connection.type]}
                  />
                  <Card.Header>{connection.name}</Card.Header>
                  <Card.Meta style={styles.smallerText}>
                    {`Created on ${moment(connection.createdAt).format("LLL")}`}
                  </Card.Meta>
                  <Card.Description />
                </Card.Content>
                {_canAccess("admin") && (
                  <Card.Content extra>
                    <Button.Group widths={2}>
                      <Button
                        primary
                        onClick={() => _onEditConnection(connection)}
                        className="tertiary"
                        style={{ borderRight: `0.2px solid ${lightGray}` }}
                      >
                        Edit
                      </Button>
                      <Button
                        color="red"
                        loading={removeLoading === connection.id}
                        onClick={() => _onRemoveConfirmation(connection)}
                        className="tertiary"
                      >
                        Remove
                      </Button>
                    </Button.Group>
                  </Card.Content>
                )}
              </Card>
            );
          })}
        </Card.Group>
      </Container>

      {/* REMOVE CONFIRMATION MODAL */}
      <TransitionablePortal open={removeModal}>
        <Modal open={removeModal} basic size="small" onClose={() => setRemoveModal(false)}>
          <Header
            icon="exclamation triangle"
            content="Are you sure you want to remove this connection?"
          />
          <Modal.Content>
            <p>
              {"All the charts that are using this connection will stop working."}
            </p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              basic
              inverted
              onClick={() => setRemoveModal(false)}
            >
              Go back
            </Button>
            <Button
              color="orange"
              inverted
              loading={!!removeLoading}
              onClick={_onRemoveConnection}
            >
              <Icon name="x" />
              Remove completely
            </Button>
          </Modal.Actions>
        </Modal>
      </TransitionablePortal>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  mainContent: {
    padding: 20,
  },
  selectedConnection: {
    boxShadow: `${primary} 0 3px 3px 0, ${primary} 0 0 0 3px`,
  },
  smallerText: {
    fontSize: 12,
  }
};

Connections.propTypes = {
  connections: PropTypes.array.isRequired,
  team: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  removeConnection: PropTypes.func.isRequired,
  getProjectConnections: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  cleanErrors: PropTypes.func.isRequired,
  saveConnection: PropTypes.func.isRequired,
  addConnection: PropTypes.func.isRequired,
  testRequest: PropTypes.func.isRequired,
  getProjectCharts: PropTypes.func.isRequired,
  getTemplates: PropTypes.func.isRequired,
  templates: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    connections: state.connection.data,
    team: state.team.active,
    user: state.user.data,
    templates: state.template,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    testRequest: (projectId, data) => dispatch(testRequestAction(projectId, data)),
    removeConnection: (projectId, id) => dispatch(removeConnectionAction(projectId, id)),
    getProjectConnections: (projectId) => dispatch(getProjectConnectionsAction(projectId)),
    addConnection: (projectId, connection) => dispatch(addConnectionAction(projectId, connection)),
    saveConnection: (projectId, connection) => {
      return dispatch(saveConnectionAction(projectId, connection));
    },
    cleanErrors: () => dispatch(cleanErrorsAction()),
    getProjectCharts: (projectId) => dispatch(getProjectChartsAction(projectId)),
    getTemplates: (teamId) => dispatch(getTemplatesAction(teamId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Connections);
