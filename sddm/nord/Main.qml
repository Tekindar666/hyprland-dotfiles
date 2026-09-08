import QtQuick 2.15
import QtQuick.Window 2.15
import SddmComponents 2.0

Rectangle {
    id: root

    width: Screen.width
    height: Screen.height
    color: "#2E3440"

    readonly property real uiScale: Math.min(1.5, Math.max(1.0, Math.min(width / 2560, height / 1440)))
    readonly property string fontFamily: "JetBrainsMono Nerd Font"
    property int sessionIndex: session.index
    property date now: new Date()

    function submitLogin() {
        if (usernameInput.text.length === 0) {
            statusText.text = "Enter a username"
            usernameInput.forceActiveFocus()
            return
        }

        statusText.text = "Signing in…"
        sddm.login(usernameInput.text, passwordInput.text, sessionIndex)
    }

    component ActionButton: Rectangle {
        id: actionButton

        property string label: ""
        signal triggered()

        activeFocusOnTab: true
        height: 48 * root.uiScale
        radius: 7 * root.uiScale
        color: actionMouse.containsMouse || activeFocus ? "#434C5E" : "#3B4252"
        border.width: activeFocus ? 1 : 0
        border.color: "#4C566A"

        Text {
            anchors.centerIn: parent
            text: actionButton.label
            color: "#D8DEE9"
            font.family: root.fontFamily
            font.pixelSize: 15 * root.uiScale
        }

        MouseArea {
            id: actionMouse
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            hoverEnabled: true
            onClicked: actionButton.triggered()
        }

        Keys.onReturnPressed: actionButton.triggered()
        Keys.onEnterPressed: actionButton.triggered()
    }

    Image {
        anchors.fill: parent
        source: "background.png"
        fillMode: Image.PreserveAspectCrop
        asynchronous: true
    }

    Column {
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.topMargin: 64 * root.uiScale
        spacing: 2 * root.uiScale

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: Qt.formatTime(root.now, "HH:mm")
            color: "#2E3440"
            font.family: root.fontFamily
            font.pixelSize: 54 * root.uiScale
            font.weight: Font.DemiBold
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: Qt.formatDate(root.now, "dddd, MMMM d")
            color: "#3B4252"
            font.family: root.fontFamily
            font.pixelSize: 15 * root.uiScale
        }
    }

    Timer {
        interval: 1000
        running: true
        repeat: true
        onTriggered: root.now = new Date()
    }

    Rectangle {
        id: panel

        width: 520 * root.uiScale
        height: 470 * root.uiScale
        anchors.bottom: parent.bottom
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottomMargin: 92 * root.uiScale
        radius: 14 * root.uiScale
        color: "#f22e3440"
        border.width: 1
        border.color: "#4C566A"

        Column {
            id: form

            anchors.fill: parent
            anchors.margins: 42 * root.uiScale
            spacing: 12 * root.uiScale

            Text {
                width: parent.width
                text: "Welcome back"
                color: "#ECEFF4"
                horizontalAlignment: Text.AlignHCenter
                font.family: root.fontFamily
                font.pixelSize: 24 * root.uiScale
                font.weight: Font.DemiBold
            }

            Text {
                width: parent.width
                text: sddm.hostName
                color: "#81A1C1"
                horizontalAlignment: Text.AlignHCenter
                font.family: root.fontFamily
                font.pixelSize: 13 * root.uiScale
            }

            Item {
                width: 1
                height: 4 * root.uiScale
            }

            Text {
                text: "Username"
                color: "#D8DEE9"
                font.family: root.fontFamily
                font.pixelSize: 13 * root.uiScale
            }

            Rectangle {
                width: parent.width
                height: 46 * root.uiScale
                radius: 7 * root.uiScale
                color: "#3B4252"
                border.width: usernameInput.activeFocus ? 1 : 0
                border.color: "#4C566A"

                TextInput {
                    id: usernameInput

                    anchors.fill: parent
                    anchors.leftMargin: 14 * root.uiScale
                    anchors.rightMargin: 14 * root.uiScale
                    verticalAlignment: TextInput.AlignVCenter
                    text: userModel.lastUser
                    color: "#ECEFF4"
                    selectionColor: "#4C566A"
                    selectedTextColor: "#ECEFF4"
                    font.family: root.fontFamily
                    font.pixelSize: 15 * root.uiScale
                    selectByMouse: true
                    activeFocusOnTab: true
                    KeyNavigation.tab: passwordInput
                    Keys.onReturnPressed: passwordInput.forceActiveFocus()
                    Keys.onEnterPressed: passwordInput.forceActiveFocus()
                }
            }

            Text {
                text: "Password"
                color: "#D8DEE9"
                font.family: root.fontFamily
                font.pixelSize: 13 * root.uiScale
            }

            Rectangle {
                width: parent.width
                height: 46 * root.uiScale
                radius: 7 * root.uiScale
                color: "#3B4252"
                border.width: passwordInput.activeFocus ? 1 : 0
                border.color: "#4C566A"

                TextInput {
                    id: passwordInput

                    anchors.fill: parent
                    anchors.leftMargin: 14 * root.uiScale
                    anchors.rightMargin: 14 * root.uiScale
                    verticalAlignment: TextInput.AlignVCenter
                    color: "#ECEFF4"
                    selectionColor: "#4C566A"
                    selectedTextColor: "#ECEFF4"
                    echoMode: TextInput.Password
                    passwordCharacter: "•"
                    font.family: root.fontFamily
                    font.pixelSize: 15 * root.uiScale
                    selectByMouse: true
                    activeFocusOnTab: true
                    KeyNavigation.backtab: usernameInput
                    KeyNavigation.tab: session
                    Keys.onReturnPressed: root.submitLogin()
                    Keys.onEnterPressed: root.submitLogin()
                }
            }

            Text {
                id: statusText

                width: parent.width
                height: 20 * root.uiScale
                text: ""
                color: "#BF616A"
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
                elide: Text.ElideRight
                font.family: root.fontFamily
                font.pixelSize: 12 * root.uiScale
            }

            ActionButton {
                id: loginButton
                width: parent.width
                label: "Sign in"
                KeyNavigation.backtab: session
                onTriggered: root.submitLogin()
            }

            Row {
                width: parent.width
                height: 42 * root.uiScale
                spacing: 10 * root.uiScale

                ComboBox {
                    id: session

                    width: parent.width
                        - (powerButton.visible ? powerButton.width + parent.spacing : 0)
                        - (rebootButton.visible ? rebootButton.width + parent.spacing : 0)
                    height: parent.height
                    model: sessionModel
                    index: sessionModel.lastIndex >= 0 ? sessionModel.lastIndex : 0
                    color: "#3B4252"
                    arrowColor: "#3B4252"
                    borderColor: "#4C566A"
                    focusColor: "#4C566A"
                    hoverColor: "#434C5E"
                    menuColor: "#3B4252"
                    textColor: "#D8DEE9"
                    font.family: root.fontFamily
                    font.pixelSize: 13 * root.uiScale
                    KeyNavigation.backtab: passwordInput
                    KeyNavigation.tab: loginButton
                }

                ActionButton {
                    id: rebootButton
                    width: 92 * root.uiScale
                    height: parent.height
                    label: "Restart"
                    visible: sddm.canReboot
                    onTriggered: sddm.reboot()
                }

                ActionButton {
                    id: powerButton
                    width: 92 * root.uiScale
                    height: parent.height
                    label: "Power"
                    visible: sddm.canPowerOff
                    onTriggered: sddm.powerOff()
                }
            }
        }
    }

    Connections {
        target: sddm

        function onLoginSucceeded() {
            statusText.color = "#A3BE8C"
            statusText.text = "Starting Hyprland…"
        }

        function onLoginFailed() {
            passwordInput.text = ""
            statusText.color = "#BF616A"
            statusText.text = "Authentication failed"
            passwordInput.forceActiveFocus()
        }

        function onInformationMessage(message) {
            statusText.color = "#81A1C1"
            statusText.text = message
        }
    }

    Component.onCompleted: {
        if (usernameInput.text.length === 0)
            usernameInput.forceActiveFocus()
        else
            passwordInput.forceActiveFocus()
    }
}
