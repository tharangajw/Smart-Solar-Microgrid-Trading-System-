package sliit.ead.smartsolarmicrogrid.modules.authentication;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;
import sliit.ead.smartsolarmicrogrid.modules.operator.OperatorDashboardActivity;
import sliit.ead.smartsolarmicrogrid.modules.procumer.ProsumerDashboardActivity;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        Button buttonLogin = findViewById(R.id.buttonLogin);
        TextView textViewRegister = findViewById(R.id.textViewRegisterPrompt);

        buttonLogin.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, ProsumerDashboardActivity.class));
        });

        textViewRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });
    }
}
