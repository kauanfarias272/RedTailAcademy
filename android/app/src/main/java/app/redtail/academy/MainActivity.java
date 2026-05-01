package app.redtail.academy;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MandarinTtsPlugin.class);
        registerPlugin(MandarinSpeechPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
