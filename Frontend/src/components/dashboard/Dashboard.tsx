"use client";
import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Modal, Rate, Spin } from "antd";
import { FaSmile, FaMeh, FaFrown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUserActions, useUserState } from "@/providers/users-providers";
import {
  useSurvivorActions,
  useSurvivorState,
} from "@/providers/survivors-provider";
import withAuth from "@/hoc/withAuth";
import { useDashboardStyles } from "./styles";

const { Title, Text } = Typography;

const Dashboard = () => {
  const { styles } = useDashboardStyles();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const { getCurrentUser } = useUserActions();
  const { getCurrentSurvivor } = useSurvivorActions();
  const { isPending, isError } = useUserState();
  const { currentSurvivor } = useSurvivorState();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const showRatingModal = (mood: string) => {
    setSelectedEmoji(mood);
    setIsModalVisible(true);
  };

  const handleModalOk = () => setIsModalVisible(false);
  const handleModalCancel = () => setIsModalVisible(false);

  const handleTestimonyClick = () => router.push("/survivor/testimony");
  const handleJournalClick = () => router.push("/survivor/journalEntry");
  const handleChatClick = () => router.push("/survivor/humanTherapist");

  useEffect(() => {
    fetchSurvivorOnReload();
  }, []);

  useEffect(() => {
    setLoading(isPending);
    if (isError) setLoading(false);
  }, [isPending, isError]);

  const fetchSurvivorOnReload = async () => {
    const token = sessionStorage.getItem("jwt");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      setLoading(true);
      const user = await getCurrentUser();
      await getCurrentSurvivor(user.id);
    } catch (err) {
      console.error("Error loading the Survivor:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.content}>
        <Card className={styles.welcomeCard}>
          <Title level={4}>
            👋 Welcome,{" "}
            {currentSurvivor?.isAnonymous
              ? currentSurvivor?.anonymousId
              : currentSurvivor?.useDisplayNameOnly
              ? currentSurvivor?.displayName
              : currentSurvivor?.name}
            !
          </Title>
          <p>
            Today is a new day. You are strong and resilient. <br />
            Remember to take care of yourself and reach out for support when
            needed.
          </p>
        </Card>

        <div className={styles.moodSection}>
          <Title level={4}>How are you feeling today?</Title>
          <div className={styles.emojiContainer}>
            <FaSmile
              className={styles.emoji}
              onClick={() => showRatingModal("Happy")}
            />
            <FaMeh
              className={styles.emoji}
              onClick={() => showRatingModal("Neutral")}
            />
            <FaFrown
              className={styles.emoji}
              onClick={() => showRatingModal("Sad")}
            />
          </div>
        </div>

        <Modal
          title={`Ratne your mood: ${selectedEmoji}`}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        >
          <Rate />
        </Modal>

        <div className={styles.quoteBox}>
          <Text italic>
            When you love what you have, you have everything you need
          </Text>
          <br />
          <Text strong>- Unknown</Text>
        </div>

        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={24} md={8}>
            <Card
              className={styles.card}
              hoverable
              onClick={handleTestimonyClick}
              cover={<div className={styles.testimonyCard}></div>}
            >
              <Card.Meta title="Write Testimony ?" />
            </Card>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Card
              className={styles.card}
              hoverable
              onClick={handleJournalClick}
              cover={<div className={styles.journalCard}></div>}
            >
              <Card.Meta title="Write Journal Entry?" />
            </Card>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Card
              className={styles.card}
              hoverable
              onClick={handleChatClick}
              cover={<div className={styles.chatCard}></div>}
            >
              <Card.Meta title="Let's Talk 🗨️" />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default withAuth(Dashboard);
