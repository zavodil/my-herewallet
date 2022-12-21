import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { HereProviderRequest } from "@here-wallet/core";
import { colors } from "../uikit/theme";
import { ActionView } from "./Action";
import { P } from "./fonts";

// @ts-ignore
import ArrowRightIcon from "../assets/icons/arrow-right.svg";
// @ts-ignore
import ArrowLeftIcon from "../assets/icons/arrow-left.svg";
import { fetchTokens, FtToken, nearToken } from "./TokensStorage";

export const Connector = ({ request }: { request: HereProviderRequest }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tokens, setTokens] = useState<FtToken[]>([nearToken]);
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>();

  useEffect(() => {
    fetchTokens().then(setTokens);
  });

  const handlePageChange = (e: any) => {
    var offset = e.nativeEvent.contentOffset;
    var page = Math.round(offset.x / width) + 1;
    if (currentPage !== page) {
      setCurrentPage(page);
    }
  };

  const nextPage = (diff: number) => {
    scrollRef.current.scrollTo({
      y: 0,
      x: (currentPage + diff - 1) * width,
      animated: true,
    });
  };

  const actionsCount = request.transactions.reduce((acc, trx) => acc + trx.actions.length, 0);

  return (
    <View style={styles.container} onLayout={(b) => setWidth(b.nativeEvent.layout.width)}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity
          onPress={() => nextPage(-1)}
          disabled={currentPage === 1}
          style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
        >
          <ArrowLeftIcon />
        </TouchableOpacity>
        <P style={{ marginHorizontal: 12 }}>
          {currentPage}/{actionsCount}
        </P>
        <TouchableOpacity
          onPress={() => nextPage(1)}
          disabled={currentPage === actionsCount}
          style={{ opacity: currentPage === actionsCount ? 0.3 : 1 }}
        >
          <ArrowRightIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        scrollEventThrottle={100}
        onScroll={handlePageChange}
        showsHorizontalScrollIndicator={false}
        decelerationRate={0}
        snapToInterval={width}
        snapToAlignment="center"
        style={{ flexDirection: "row", marginTop: 10 }}
      >
        {request.transactions.flatMap((trx, i) =>
          trx.actions.map((action, j) => (
            <View key={`${i}_${j}`} style={{ width, paddingHorizontal: 16 }}>
              <ActionView receiver={trx.receiverId ?? "Your wallet"} action={action} tokens={tokens} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignSelf: "stretch",
    flex: 1,
  },
});
